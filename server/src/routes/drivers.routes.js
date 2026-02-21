const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { listDrivers, createDriver, setDriverStatus, driversMetrics, renewLicense } = require("../controllers/drivers.controller");

router.get("/", requireAuth, listDrivers);
router.get("/metrics", requireAuth, driversMetrics);
router.post("/", requireAuth, requireRole(["FLEET_MANAGER", "SAFETY_OFFICER", "DISPATCHER"]), createDriver);
router.patch("/:id/status", requireAuth, requireRole(["FLEET_MANAGER", "SAFETY_OFFICER", "DISPATCHER"]), setDriverStatus);
router.patch("/:id/license", requireAuth, requireRole(["FLEET_MANAGER", "SAFETY_OFFICER", "DISPATCHER"]), renewLicense);

module.exports = router;
