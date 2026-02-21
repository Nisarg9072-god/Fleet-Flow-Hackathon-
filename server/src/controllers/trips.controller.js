const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

function genTripCode() {
  return "TRIP-" + Math.random().toString(16).slice(2, 8).toUpperCase();
}

async function createTrip(req, res, next) {
  try {
    const { vehicleId, driverId, origin, destination, cargoWeightKg, revenue } = req.body;
    if (!vehicleId || !driverId || !origin || !destination || !cargoWeightKg) {
      throw new HttpError(400, "VALIDATION_ERROR", "vehicleId, driverId, origin, destination, cargoWeightKg required");
    }
    const trip = await prisma.trip.create({
      data: {
        tripCode: genTripCode(),
        vehicleId,
        driverId,
        origin,
        destination,
        cargoWeightKg: Number(cargoWeightKg),
        revenue: revenue ? Number(revenue) : 0,
        createdByUserId: req.user.id
      }
    });
    res.status(201).json({ success: true, trip });
  } catch (e) {
    next(e);
  }
}

async function dispatchTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new HttpError(404, "NOT_FOUND", "Trip not found");
    if (trip.status !== "DRAFT") throw new HttpError(400, "INVALID_STATE", "Only DRAFT trips can be dispatched");
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: trip.vehicleId } }),
      prisma.driver.findUnique({ where: { id: trip.driverId } })
    ]);
    if (!vehicle) throw new HttpError(404, "NOT_FOUND", "Vehicle not found");
    if (!driver) throw new HttpError(404, "NOT_FOUND", "Driver not found");
    if (vehicle.status !== "AVAILABLE") throw new HttpError(400, "VEHICLE_NOT_AVAILABLE", "Vehicle is not available");
    if (driver.status !== "ON_DUTY") throw new HttpError(400, "DRIVER_NOT_AVAILABLE", "Driver is not ON_DUTY");
    const now = new Date();
    if (driver.licenseExpiryDate < now) throw new HttpError(400, "DRIVER_LICENSE_EXPIRED", "Driver license expired");
    if (driver.licenseCategory !== vehicle.type)
      throw new HttpError(400, "DRIVER_CATEGORY_MISMATCH", "Driver category mismatch for vehicle");
    if (trip.cargoWeightKg > vehicle.maxCapacityKg)
      throw new HttpError(400, "CARGO_EXCEEDS_CAPACITY", "Cargo weight exceeds vehicle capacity");
    const result = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: "DISPATCHED",
          startTime: now,
          startOdometerKm: vehicle.odometerKm
        }
      });
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "ON_TRIP" }
      });
      const updatedDriver = await tx.driver.update({
        where: { id: driver.id },
        data: { status: "ON_TRIP" }
      });
      return { updatedTrip, updatedVehicle, updatedDriver };
    });
    emitEvent("trip:dispatched", { tripId: id });
    emitEvent("vehicle:statusChanged", { vehicleId: vehicle.id, status: "ON_TRIP" });
    emitEvent("driver:statusChanged", { driverId: driver.id, status: "ON_TRIP" });
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function completeTrip(req, res, next) {
  try {
    const { id } = req.params;
    const { endOdometerKm } = req.body;
    if (endOdometerKm === undefined) throw new HttpError(400, "VALIDATION_ERROR", "endOdometerKm required");
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new HttpError(404, "NOT_FOUND", "Trip not found");
    if (trip.status !== "DISPATCHED") throw new HttpError(400, "INVALID_STATE", "Only DISPATCHED trips can be completed");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: trip.driverId } });
    const endKm = Number(endOdometerKm);
    if (trip.startOdometerKm != null && endKm < trip.startOdometerKm) {
      throw new HttpError(400, "VALIDATION_ERROR", "endOdometerKm cannot be less than startOdometerKm");
    }
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: { status: "COMPLETED", endTime: now, endOdometerKm: endKm }
      });
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "AVAILABLE", odometerKm: endKm }
      });
      const updatedDriver = await tx.driver.update({
        where: { id: driver.id },
        data: { status: "ON_DUTY" }
      });
      return { updatedTrip, updatedVehicle, updatedDriver };
    });
    emitEvent("trip:completed", { tripId: id });
    emitEvent("vehicle:statusChanged", { vehicleId: vehicle.id, status: "AVAILABLE" });
    emitEvent("driver:statusChanged", { driverId: driver.id, status: "ON_DUTY" });
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function listTrips(req, res, next) {
  try {
    const { status } = req.query;
    const trips = await prisma.trip.findMany({
      where: { ...(status ? { status } : {}) },
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, trips });
  } catch (e) {
    next(e);
  }
}

module.exports = { createTrip, dispatchTrip, completeTrip, listTrips };
