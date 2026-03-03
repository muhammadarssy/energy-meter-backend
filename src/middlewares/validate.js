const { error } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Validation middleware factory for Joi schemas
 * @param {Object} schema - Joi schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error: validationError, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (validationError) {
            const errors = validationError.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/"/g, ''),
                value: detail.context?.value
            }));
            logger.warn('Validation Failed', { requestId: req.requestId, source, errors });
            return error.unprocessableEntity(res, 'Validation failed', errors);
        }

        req[source] = value;
        next();
    };
};

module.exports = { validate };
