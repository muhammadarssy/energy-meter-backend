const Joi = require('joi');

const warehouseRequestValidation = {
    create: Joi.object({
        request_type: Joi.string().valid('inbound_receiving', 'inbound_assembly').required(),
        warehouse_id: Joi.string().uuid().required(),
        receiving_header_id: Joi.string().uuid().optional().allow(null),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        requested_by: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).custom((value, helpers) => {
        if (value.request_type === 'inbound_receiving' && !value.receiving_header_id) {
            return helpers.error('any.invalid', { message: 'receiving_header_id is required for inbound_receiving' });
        }
        if (value.request_type === 'inbound_assembly' && !value.assembly_order_id) {
            return helpers.error('any.invalid', { message: 'assembly_order_id is required for inbound_assembly' });
        }
        return value;
    }),

    approve: Joi.object({
        approved_by: Joi.string().uuid().required()
    }),

    reject: Joi.object({
        rejected_by: Joi.string().uuid().required(),
        reason: Joi.string().max(1000).allow('', null).optional()
    }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        request_type: Joi.string().valid('inbound_receiving', 'inbound_assembly').optional(),
        status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
        warehouse_id: Joi.string().uuid().optional()
    })
};

module.exports = { warehouseRequestValidation };
