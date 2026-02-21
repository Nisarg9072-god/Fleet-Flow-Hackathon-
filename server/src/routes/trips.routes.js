const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { createTrip, dispatchTrip, completeTrip, listTrips } = require("../controllers/trips.controller");

router.get("/", requireAuth, listTrips);
router.post("/", requireAuth, requireRole(["DISPATCHER"]), createTrip);
router.post("/:id/dispatch", requireAuth, requireRole(["DISPATCHER"]), dispatchTrip);
router.post("/:id/complete", requireAuth, requireRole(["DISPATCHER", "FLEET_MANAGER"]), completeTrip);

module.exports = router;
