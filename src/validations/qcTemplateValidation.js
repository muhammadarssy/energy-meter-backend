const Joi = require('joi');

const qcTemplateValidation = {
    create: Joi.object({
        code: Joi.string().trim().max(50).required(),
        name: Joi.string().trim().max(255).required(),
        description: Joi.string().max(1000).allow('', null).optional(),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').required().messages({
            'any.only': 'qc_phase must be one of: receiving, assembly, shipping',
            'any.required': 'qc_phase is required'
        }),
        display_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true)
    }),

    update: Joi.object({
        code: Joi.string().trim().max(50).optional(),
        name: Joi.string().trim().max(255).optional(),
        description: Joi.string().max(1000).allow('', null).optional(),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
        display_order: Joi.number().integer().min(0).optional(),
        is_active: Joi.boolean().optional()
    }).min(1).messages({ 'object.min': 'At least one field is required for update' }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
        is_active: Joi.boolean().optional(),
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
