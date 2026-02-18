/**
 * Custom Application Error
 * Extends the native Error class with HTTP status code and operational flag.
 * Operational errors are expected (e.g. bad user input) vs programmer errors.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
