const errorHandler = (err, req, res, next) => {
  console.error("[CyberShield Error]", err.stack || err.message || err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "An internal server error occurred.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = errorHandler;
