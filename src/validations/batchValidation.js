const Joi = require('joi');

const batchValidation = {
    create: Joi.object({
        batch_number: Joi.string().trim().max(100).required(),
        supplier_batch_code: Joi.string().max(100).allow('', null).optional(),
        notes: Joi.string().max(1000).allow('', null).optional()
    }),

    update: Joi.object({
        batch_number: Joi.string().trim().max(100).optional(),
        supplier_batch_code: Joi.string().max(100).allow('', null).optional(),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().max(255).allow('').optional(),
        sortBy: Joi.string().valid('batch_number', 'created_at').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = { batchValidation };
