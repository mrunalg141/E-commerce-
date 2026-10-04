/**
 * Global Error Handling Middleware
 * Should be the last middleware in the application
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && status >= 500
    ? 'Internal server error.'
    : err.message || 'Internal Server Error';

  if (isProduction) {
    console.error(`[ERROR] ${status} - ${message}`);
  } else {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
