const router = require("express").Router();
const { login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth");

router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
