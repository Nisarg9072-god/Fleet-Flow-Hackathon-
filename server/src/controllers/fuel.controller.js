const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");

async function addFuel(req, res, next) {
  try {
    const { vehicleId, tripId, liters, cost, fuelDate, odometerKm } = req.body;
    if (!vehicleId || liters === undefined || cost === undefined)
      throw new HttpError(400, "VALIDATION_ERROR", "vehicleId, liters, cost required");

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        tripId: tripId || null,
        liters: Number(liters),
        cost: Number(cost),
        fuelDate: fuelDate ? new Date(fuelDate) : new Date(),
        odometerKm: odometerKm !== undefined ? Number(odometerKm) : null,
        createdByUserId: req.user.id
      }
    });

    res.status(201).json({ success: true, log });
  } catch (e) {
    next(e);
  }
}

async function listFuel(req, res, next) {
  try {
    const { vehicleId } = req.query;
    const logs = await prisma.fuelLog.findMany({
      where: { ...(vehicleId ? { vehicleId } : {}) },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, logs });
  } catch (e) {
    next(e);
  }
}

module.exports = { addFuel, listFuel };
