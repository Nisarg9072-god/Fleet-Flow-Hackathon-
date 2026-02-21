const prisma = require("../config/prisma");
const { HttpError } = require("../utils/httpError");
const { emitEvent } = require("../sockets");

async function listDrivers(req, res, next) {
  try {
    const { status } = req.query;

    const drivers = await prisma.driver.findMany({
      where: {
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, drivers });
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

module.exports = { listDrivers, createDriver, setDriverStatus };
