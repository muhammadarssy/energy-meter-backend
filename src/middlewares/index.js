const crypto = require('crypto');
const logger = require('../config/logger');
const { error } = require('../utils/response');

const requestId = (req, res, next) => {
    const id = crypto.randomUUID();
    req.requestId = id;
    res.locals.requestId = id;
    res.setHeader('X-Request-ID', id);
    next();
};

const requestLogger = (req, res, next) => {
    const start = Date.now();
    logger.info('Incoming Request', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });

    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        logger.info('Request Completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`
        });
        originalEnd.call(this, chunk, encoding);
    };
    next();
};

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled Error', {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    // Prisma errors
    if (err.code) {
        switch (err.code) {
            case 'P2002':
                return error.conflict(res, 'Unique constraint violation', [{
                    field: err.meta?.target?.[0] || 'unknown',
                    message: 'Value already exists'
                }]);
            case 'P2025':
                return error.notFound(res, err.meta?.cause || 'Record not found');
            case 'P2003':
                return error.badRequest(res, 'Foreign key constraint violation', [{
                    field: err.meta?.field_name || 'unknown',
                    message: 'Referenced record does not exist'
                }]);
            default:
                return error.internalError(res, 'Database error', [{
                    code: err.code,
                    message: err.message
                }]);
        }
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return error.badRequest(res, 'File size exceeds limit');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return error.badRequest(res, 'Too many files');
    }

    // Joi validation errors
    if (err.isJoi) {
        const validationErrors = err.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));
        return error.unprocessableEntity(res, 'Validation failed', validationErrors);
    }

    return error.internalError(res, 'An unexpected error occurred');
};

const notFoundHandler = (req, res) => {
    return error.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { requestId, requestLogger, errorHandler, notFoundHandler, asyncHandler };
