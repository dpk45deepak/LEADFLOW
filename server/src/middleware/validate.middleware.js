import { ApiError } from '../utils/ApiError.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/** Validate req[source] with a zod schema and replace it with the parsed (stripped, coerced) value. */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.') || source, message: i.message }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };

export const validateObjectId =
  (param = 'id') =>
  (req, _res, next) => {
    if (!OBJECT_ID.test(req.params[param])) return next(ApiError.badRequest('Invalid lead ID'));
    next();
  };
