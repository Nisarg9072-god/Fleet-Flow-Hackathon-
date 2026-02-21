const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { createMaintenance, listMaintenance } = require("../controllers/maintenance.controller");

router.get("/", requireAuth, listMaintenance);
router.post("/", requireAuth, requireRole(["FLEET_MANAGER"]), createMaintenance);

module.exports = router;
