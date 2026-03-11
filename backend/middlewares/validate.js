'use strict';

const { ZodError } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Factory – returns an Express middleware that validates req against a Zod schema.
 * The schema should be an object schema with optional `body`, `params`, `query` keys.
 * @param {import('zod').ZodObject} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Attach parsed/coerced values back onto req
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params;
    if (parsed.query) req.query = parsed.query;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => `${e.path.slice(1).join('.')}: ${e.message}`);
      return sendError(res, 'Validation failed', 422, errors);
    }
    next(err);
  }
};

module.exports = validate;
