const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/httpError");

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "UNAUTHORIZED", "Missing token"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "Invalid token"));
  }
}

function requireRole(roles = []) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, "UNAUTHORIZED", "Not logged in"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "FORBIDDEN", "Insufficient role"));
    next();
  };
}

module.exports = { requireAuth, requireRole };
