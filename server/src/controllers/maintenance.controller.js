const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

async function createMaintenance(req, res, next) {
  try {
    const { vehicleId, serviceType, cost, serviceDate, vendor, notes } = req.body;
    if (!vehicleId || !serviceType) throw new HttpError(400, "VALIDATION_ERROR", "vehicleId & serviceType required");
    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId,
          serviceType,
          cost: cost ? Number(cost) : 0,
          serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
          vendor: vendor || null,
          notes: notes || null,
          createdByUserId: req.user.id
        }
      });
      const vehicle = await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: "IN_SHOP" }
      });
      return { log, vehicle };
    });
    emitEvent("maintenance:logged", { vehicleId });
    emitEvent("vehicle:statusChanged", { vehicleId, status: "IN_SHOP" });
    res.status(201).json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function listMaintenance(req, res, next) {
  try {
    const { vehicleId } = req.query;
    const logs = await prisma.maintenanceLog.findMany({
      where: { ...(vehicleId ? { vehicleId } : {}) },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, logs });
  } catch (e) {
    next(e);
  }
}

module.exports = { createMaintenance, listMaintenance };
