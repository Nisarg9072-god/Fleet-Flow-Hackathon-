const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

async function listVehicles(req, res, next) {
  try {
    const { type, status, region } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(region ? { region } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, vehicles });
  } catch (e) {
    next(e);
  }
}

async function createVehicle(req, res, next) {
  try {
    const { vehicleCode, type, licensePlate, maxCapacityKg, model, region, acquisitionCost } = req.body;
    if (!vehicleCode || !type || !licensePlate || !maxCapacityKg)
      throw new HttpError(400, "VALIDATION_ERROR", "vehicleCode, type, licensePlate, maxCapacityKg required");

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleCode,
        type,
        licensePlate,
        maxCapacityKg: Number(maxCapacityKg),
        model: model || null,
        region: region || null,
        acquisitionCost: acquisitionCost ? Number(acquisitionCost) : 0
      }
    });

    emitEvent("vehicle:statusChanged", { vehicleId: vehicle.id, status: vehicle.status });
    res.status(201).json({ success: true, vehicle });
  } catch (e) {
    next(e);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: req.body
    });

    emitEvent("vehicle:updated", { vehicleId: vehicle.id });
    res.json({ success: true, vehicle });
  } catch (e) {
    next(e);
  }
}

async function setOutOfService(req, res, next) {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: "OUT_OF_SERVICE" }
    });

    emitEvent("vehicle:statusChanged", { vehicleId: vehicle.id, status: vehicle.status });
    res.json({ success: true, vehicle });
  } catch (e) {
    next(e);
  }
}

module.exports = { listVehicles, createVehicle, updateVehicle, setOutOfService };
