const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { listVehicles, createVehicle, updateVehicle, setOutOfService } = require("../controllers/vehicles.controller");

router.get("/", requireAuth, listVehicles);
router.post("/", requireAuth, requireRole(["FLEET_MANAGER"]), createVehicle);
router.patch("/:id", requireAuth, requireRole(["FLEET_MANAGER"]), updateVehicle);
router.patch("/:id/out-of-service", requireAuth, requireRole(["FLEET_MANAGER"]), setOutOfService);

module.exports = router;
