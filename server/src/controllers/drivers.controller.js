const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

async function listDrivers(req, res, next) {
  try {
    const { status, q, validOnly } = req.query;

    const drivers = await prisma.driver.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(validOnly
          ? { licenseExpiryDate: { gte: new Date() } }
          : {}),
        ...(q
          ? {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { licenseNumber: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, drivers });
  } catch (e) {
    next(e);
  }
}

async function driversMetrics(req, res, next) {
  try {
    const grouped = await prisma.trip.groupBy({
      by: ["driverId", "status"],
      _count: { _all: true }
    });
    const totals = {};
    for (const row of grouped) {
      const did = row.driverId;
      if (!did) continue;
      totals[did] = totals[did] || { total: 0, completed: 0 };
      totals[did].total += row._count._all;
      if (row.status === "COMPLETED") totals[did].completed += row._count._all;
    }
    const metrics = Object.entries(totals).map(([driverId, v]) => ({
      driverId,
      totalTrips: v.total,
      completedTrips: v.completed,
      completionRate: v.total ? Math.round((v.completed / v.total) * 100) : 0,
      complaints: 0
    }));
    res.json({ success: true, metrics });
  } catch (e) {
    next(e);
  }
}

async function renewLicense(req, res, next) {
  try {
    const { id } = req.params;
    const { licenseExpiryDate } = req.body || {};
    const newDate = licenseExpiryDate ? new Date(licenseExpiryDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000);
    const driver = await prisma.driver.update({
      where: { id },
      data: { licenseExpiryDate: newDate }
    });
    res.json({ success: true, driver });
  } catch (e) {
    next(e);
  }
}

async function createDriver(req, res, next) {
  try {
    const { fullName, licenseNumber, licenseExpiryDate, licenseCategory, phone } = req.body;
    if (!fullName || !licenseNumber || !licenseExpiryDate || !licenseCategory)
      throw new HttpError(400, "VALIDATION_ERROR", "fullName, licenseNumber, licenseExpiryDate, licenseCategory required");

    const driver = await prisma.driver.create({
      data: {
        fullName,
        phone: phone || null,
        licenseNumber,
        licenseExpiryDate: new Date(licenseExpiryDate),
        licenseCategory
      }
    });

    emitEvent("driver:statusChanged", { driverId: driver.id, status: driver.status });
    res.status(201).json({ success: true, driver });
  } catch (e) {
    next(e);
  }
}

async function setDriverStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new HttpError(400, "VALIDATION_ERROR", "status required");

    const driver = await prisma.driver.update({
      where: { id },
      data: { status }
    });

    emitEvent("driver:statusChanged", { driverId: driver.id, status: driver.status });
    res.json({ success: true, driver });
  } catch (e) {
    next(e);
  }
}

module.exports = { listDrivers, createDriver, setDriverStatus, driversMetrics, renewLicense };
