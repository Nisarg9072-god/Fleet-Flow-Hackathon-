const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

async function ping(req, res, next) {
  try {
    const { vehicleId, driverId, lat, lng, speed, speedKph, heading } = req.body || {};
    if (!vehicleId || lat === undefined || lng === undefined) {
      throw new HttpError(400, "VALIDATION_ERROR", "vehicleId, lat, lng required");
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new HttpError(404, "NOT_FOUND", "Vehicle not found");

    let driver = null;
    if (driverId) {
      driver = await prisma.driver.findUnique({ where: { id: driverId } });
      if (!driver) throw new HttpError(404, "NOT_FOUND", "Driver not found");
      if (!["ON_DUTY", "ON_TRIP"].includes(driver.status)) {
        throw new HttpError(403, "DRIVER_NOT_ACTIVE", "Driver not ON_DUTY/ON_TRIP");
      }
    }

    const vSpeed = speedKph !== undefined ? Number(speedKph) : (speed !== undefined ? Number(speed) : null);
    const record = await prisma.vehicleLocation.create({
      data: {
        vehicleId,
        driverId: driverId || null,
        lat: Number(lat),
        lng: Number(lng),
        speedKph: vSpeed,
        heading: heading !== undefined ? Number(heading) : null
      }
    });

    // Upsert latest presence
    await prisma.vehiclePresence.upsert({
      where: { vehicleId },
      update: {
        driverId: driverId || null,
        lastLat: record.lat,
        lastLng: record.lng,
        lastSpeedKph: record.speedKph,
        lastHeading: record.heading,
        lastPingAt: record.createdAt,
        status: "ONLINE"
      },
      create: {
        vehicleId,
        driverId: driverId || null,
        lastLat: record.lat,
        lastLng: record.lng,
        lastSpeedKph: record.speedKph,
        lastHeading: record.heading,
        lastPingAt: record.createdAt,
        status: "ONLINE"
      }
    });

    const payload = {
      vehicleId,
      driverId: driverId || null,
      lat: record.lat,
      lng: record.lng,
      speedKph: record.speedKph,
      heading: record.heading,
      timestamp: record.createdAt
    };
    emitEvent("location:update", payload);

    res.status(201).json({ success: true, location: record });
  } catch (e) {
    next(e);
  }
}

async function live(req, res, next) {
  try {
    const { type } = req.query || {};
    const cutoff = new Date(Date.now() - 60 * 1000); // last 60s
    const records = await prisma.vehiclePresence.findMany({
      where: {
        lastPingAt: { gte: cutoff },
        ...(type ? { vehicle: { type } } : {})
      },
      include: { vehicle: true, driver: true },
      orderBy: { lastPingAt: "desc" }
    });
    const latest = records.map((r) => ({
      vehicleId: r.vehicleId,
      driverId: r.driverId,
      lat: r.lastLat,
      lng: r.lastLng,
      speedKph: r.lastSpeedKph,
      heading: r.lastHeading,
      timestamp: r.lastPingAt,
      vehicle: { id: r.vehicle.id, vehicleCode: r.vehicle.vehicleCode, type: r.vehicle.type, status: r.vehicle.status },
      driver: r.driver
        ? { id: r.driver.id, fullName: r.driver.fullName, status: r.driver.status, licenseCategory: r.driver.licenseCategory }
        : null
    }));
    res.json({ success: true, locations: latest });
  } catch (e) {
    next(e);
  }
}

const pingLocation = ping;
const liveLocations = live;
module.exports = { ping, live, pingLocation, liveLocations };
