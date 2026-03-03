const logger = require('../config/logger');

const sendResponse = (res, statusCode, message, data = null, meta = null, errors = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId || null
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    if (errors !== null) response.errors = errors;

    if (statusCode >= 400) {
        logger.warn('API Error', { statusCode, message, errors });
    }

    return res.status(statusCode).json(response);
};

const success = {
    ok: (res, message = 'Success', data = null, meta = null) =>
        sendResponse(res, 200, message, data, meta),
    created: (res, message = 'Created successfully', data = null) =>
        sendResponse(res, 201, message, data),
    updated: (res, message = 'Updated successfully', data = null) =>
        sendResponse(res, 200, message, data),
    deleted: (res, message = 'Deleted successfully') =>
        sendResponse(res, 200, message)
};

const error = {
    badRequest: (res, message = 'Bad request', errors = null) =>
        sendResponse(res, 400, message, null, null, errors),
    unauthorized: (res, message = 'Unauthorized') =>
        sendResponse(res, 401, message),
    forbidden: (res, message = 'Forbidden') =>
        sendResponse(res, 403, message),
    notFound: (res, message = 'Resource not found') =>
        sendResponse(res, 404, message),
    conflict: (res, message = 'Conflict', errors = null) =>
        sendResponse(res, 409, message, null, null, errors),
    unprocessableEntity: (res, message = 'Validation failed', errors = null) =>
        sendResponse(res, 422, message, null, null, errors),
    internalError: (res, message = 'Internal server error', errors = null) =>
        sendResponse(res, 500, message, null, null, errors)
};

const createPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
};

module.exports = { sendResponse, success, error, createPaginationMeta };
