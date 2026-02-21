const router = require("express").Router();
const { register, login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
