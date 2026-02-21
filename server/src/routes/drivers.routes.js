const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { listDrivers, createDriver, setDriverStatus } = require("../controllers/drivers.controller");

router.get("/", requireAuth, listDrivers);
router.post("/", requireAuth, requireRole(["FLEET_MANAGER", "SAFETY_OFFICER"]), createDriver);
router.patch("/:id/status", requireAuth, requireRole(["FLEET_MANAGER", "SAFETY_OFFICER"]), setDriverStatus);

module.exports = router;
