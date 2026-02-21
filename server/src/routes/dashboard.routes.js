const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const { kpis } = require("../controllers/dashboard.controller");

router.get("/kpis", requireAuth, kpis);

module.exports = router;
