import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = 'Something went wrong. Please try again.';
  let errors;

  if (err instanceof ApiError) {
    ({ statusCode: status, message, errors } = err);
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {}).find((k) => k !== 'userId') || 'field';
    message = field === 'email' ? 'A record with this email already exists' : `Duplicate ${field}`;
    errors = [{ field, message }];
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  }

  if (status >= 500) console.error(err); // log internally, never leak to the client

  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};
