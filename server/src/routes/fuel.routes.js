const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { addFuel, listFuel } = require("../controllers/fuel.controller");

router.get("/", requireAuth, listFuel);
router.post("/", requireAuth, requireRole(["FINANCE_ANALYST", "DISPATCHER"]), addFuel);

module.exports = router;
