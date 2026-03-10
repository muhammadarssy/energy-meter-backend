const Joi = require('joi');

const receivingHeaderValidation = {
    create: Joi.object({
        gr_number: Joi.string().trim().max(100).required(),
        received_date: Joi.date().required(),
        location: Joi.string().max(255).required(),
        purchase_order_id: Joi.string().uuid().optional().allow(null),
        batch_id: Joi.string().uuid().optional().allow(null),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        received_by: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }),

    update: Joi.object({
        gr_number: Joi.string().trim().max(100).optional(),
        received_date: Joi.date().optional(),
        location: Joi.string().max(255).optional(),
        purchase_order_id: Joi.string().uuid().optional().allow(null),
        batch_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().max(255).allow('').optional(),
        batch_id: Joi.string().uuid().optional(),
        purchase_order_id: Joi.string().uuid().optional(),
        sortBy: Joi.string().valid('gr_number', 'received_date', 'created_at').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    confirm: Joi.object({
        confirmed_by: Joi.string().uuid().optional(),
        note: Joi.string().max(1000).allow('', null).optional()
    })
};

module.exports = { receivingHeaderValidation };
