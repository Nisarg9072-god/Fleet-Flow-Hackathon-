function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    code: err.code || "SERVER_ERROR",
    message: err.message || "Something went wrong",
    details: err.details || null
  });
}

module.exports = { errorHandler };
