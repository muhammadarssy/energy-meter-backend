const Joi = require('joi');

const purchaseOrderValidation = {
    create: Joi.object({
        po_number: Joi.string().trim().max(100).required(),
        order_date: Joi.date().required(),
        supplier_id: Joi.string().uuid().optional().allow(null),
        user_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }),

    update: Joi.object({
        po_number: Joi.string().trim().max(100).optional(),
        order_date: Joi.date().optional(),
        supplier_id: Joi.string().uuid().optional().allow(null),
        user_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().max(255).allow('').optional(),
        sortBy: Joi.string().valid('po_number', 'order_date', 'created_at').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = { purchaseOrderValidation };
