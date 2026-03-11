'use strict';

const { UniqueConstraintError, ValidationError } = require('sequelize');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');

  // Sequelize unique constraint
  if (err instanceof UniqueConstraintError) {
    const fields = err.errors.map((e) => e.message);
    return sendError(res, 'Duplicate entry – record already exists', 409, fields);
  }

  // Sequelize general validation
  if (err instanceof ValidationError) {
    const fields = err.errors.map((e) => e.message);
    return sendError(res, 'Database validation error', 422, fields);
  }

  // Generic
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
