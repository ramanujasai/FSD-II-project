export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || 500;

  console.error('[API Error]', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    name: err.name
  });

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Requested resource was not found.' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((item) => item.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload is too large.' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Request body contains invalid JSON.' });
  }

  const safeMessage = statusCode >= 500 && isProduction
    ? 'An unexpected server error occurred.'
    : (err.message || 'Internal Server Error');

  return res.status(statusCode).json({ success: false, message: safeMessage });
};
