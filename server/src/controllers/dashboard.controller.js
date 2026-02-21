const prisma = require("../config/prisma");

async function kpis(_req, res, next) {
  try {
    const [total, onTrip, inShop, pendingCargo] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
      prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
      prisma.trip.count({ where: { status: "DRAFT" } })
    ]);
    const utilizationRate = total === 0 ? 0 : Math.round((onTrip / total) * 100);
    res.json({
      success: true,
      kpis: {
        totalFleet: total,
        activeFleet: onTrip,
        maintenanceAlerts: inShop,
        pendingCargo,
        utilizationRate
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { kpis };
