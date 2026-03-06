const Joi = require('joi');

// Level inspection fields (optional) untuk disertakan saat create/update template
const liOptionalFields = {
    level: Joi.string().valid('I', 'II', 'III').optional(),
    aql_critical: Joi.number().min(0).optional(),
    aql_major: Joi.number().min(0).optional(),
    aql_minor: Joi.number().min(0).optional(),
    sample_size: Joi.number().integer().min(1).optional().allow(null),
    accept_critical: Joi.number().integer().min(0).optional().allow(null),
    accept_major: Joi.number().integer().min(0).optional().allow(null),
    accept_minor: Joi.number().integer().min(0).optional().allow(null),
    reject_critical: Joi.number().integer().min(0).optional().allow(null),
    reject_major: Joi.number().integer().min(0).optional().allow(null),
    reject_minor: Joi.number().integer().min(0).optional().allow(null),
    notes: Joi.string().max(500).optional().allow('', null)
};

const qcTemplateValidation = {
    create: Joi.object({
        // Tidak ada product_id — template standalone, di-assign ke product terpisah
        code: Joi.string().trim().max(50).required(),
        name: Joi.string().trim().max(255).required(),
        description: Joi.string().max(1000).allow('', null).optional(),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').required().messages({
            'any.only': 'qc_phase must be one of: receiving, assembly, shipping',
            'any.required': 'qc_phase is required'
        }),
        display_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true),
        // Level Inspection fields (opsional — bisa diisi langsung saat create)
        ...liOptionalFields
    }),

    update: Joi.object({
        code: Joi.string().trim().max(50).optional(),
        name: Joi.string().trim().max(255).optional(),
        description: Joi.string().max(1000).allow('', null).optional(),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
        display_order: Joi.number().integer().min(0).optional(),
        is_active: Joi.boolean().optional(),
        // Level Inspection fields
        ...liOptionalFields
    }).min(1).messages({ 'object.min': 'At least one field is required for update' }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        product_id: Joi.string().uuid().optional(),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
        is_active: Joi.boolean().optional(),
        unassigned: Joi.boolean().optional(), // filter: hanya template yang belum di-assign ke product
        sortBy: Joi.string().valid('display_order', 'code', 'name', 'created_at').default('display_order'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    }),

    checklistItem: {
        create: Joi.object({
            label: Joi.string().trim().max(500).required(),
            description: Joi.string().max(1000).allow('', null).optional(),
            display_order: Joi.number().integer().min(0).default(0),
            is_required: Joi.boolean().default(true)
        }),
        update: Joi.object({
            label: Joi.string().trim().max(500).optional(),
            description: Joi.string().max(1000).allow('', null).optional(),
            display_order: Joi.number().integer().min(0).optional(),
            is_required: Joi.boolean().optional()
        }).min(1)
    }
};

module.exports = { qcTemplateValidation };

