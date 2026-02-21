const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/httpError");

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) throw new HttpError(400, "VALIDATION_ERROR", "Name, email & password required");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "EMAIL_IN_USE", "Email already registered");
    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        role: role && ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCE_ANALYST"].includes(role) ? role : "DISPATCHER"
      },
      select: { id: true, name: true, email: true, role: true }
    });
    const token = jwt.sign(
      { id: created.id, role: created.role, email: created.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ success: true, token, user: created });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, "VALIDATION_ERROR", "Email & password required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, region: true }
    });
    res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, me };
