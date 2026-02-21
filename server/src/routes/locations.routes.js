const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { pingLocation, liveLocations } = require("../controllers/locations.controller");

router.post(
  "/ping",
  requireAuth,
  requireRole(["DISPATCHER", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCE_ANALYST"]),
  pingLocation
);

router.get(
  "/live",
  requireAuth,
  requireRole(["DISPATCHER", "FLEET_MANAGER", "SAFETY_OFFICER"]),
  liveLocations
);

module.exports = router;
