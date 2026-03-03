const Joi = require('joi');

const trackingValidation = {
    create: Joi.object({
        tracking_type: Joi.string().valid('receiving', 'assembly', 'shipping').required(),
        product_id: Joi.string().uuid().required(),
        receiving_item_id: Joi.string().uuid().optional().allow(null),
        assembly_id: Joi.string().uuid().optional().allow(null),
        shipping_id: Joi.string().uuid().optional().allow(null),
        pln_code_id: Joi.string().uuid().optional().allow(null),
        batch_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid(
            'created', 'on_qc', 'qc_passed', 'qc_failed',
            'in_transit', 'stored', 'shipped', 'delivered'
        ).required()
    }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        tracking_type: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
        status: Joi.string().valid('created', 'on_qc', 'qc_passed', 'qc_failed', 'in_transit', 'stored', 'shipped', 'delivered').optional(),
        product_id: Joi.string().uuid().optional(),
        sortBy: Joi.string().valid('created_at', 'status').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = { trackingValidation };
