/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express's next() error middleware.
 *
 * Usage:
 *   router.get('/path', catchAsync(async (req, res, next) => { ... }))
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
