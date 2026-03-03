const Joi = require('joi');

const levelInspectionValidation = {
    create: Joi.object({
        product_id: Joi.string().uuid().required(),
        level: Joi.string().valid('I', 'II', 'III').required().messages({
            'any.only': 'Level must be I, II, or III'
        }),
        aql_critical: Joi.number().min(0).max(100).required(),
        aql_major: Joi.number().min(0).max(100).required(),
        aql_minor: Joi.number().min(0).max(100).required(),
        sample_size: Joi.number().integer().min(1).optional().allow(null),
        accept_critical: Joi.number().integer().min(0).optional().allow(null),
        accept_major: Joi.number().integer().min(0).optional().allow(null),
        accept_minor: Joi.number().integer().min(0).optional().allow(null),
        reject_critical: Joi.number().integer().min(0).optional().allow(null),
        reject_major: Joi.number().integer().min(0).optional().allow(null),
        reject_minor: Joi.number().integer().min(0).optional().allow(null),
        qc_template_id: Joi.string().uuid().optional().allow(null),
        is_active: Joi.boolean().default(true),
        valid_from: Joi.date().optional(),
        valid_to: Joi.date().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }),

    update: Joi.object({
        level: Joi.string().valid('I', 'II', 'III').optional(),
        aql_critical: Joi.number().min(0).max(100).optional(),
        aql_major: Joi.number().min(0).max(100).optional(),
        aql_minor: Joi.number().min(0).max(100).optional(),
        sample_size: Joi.number().integer().min(1).optional().allow(null),
        accept_critical: Joi.number().integer().min(0).optional().allow(null),
        accept_major: Joi.number().integer().min(0).optional().allow(null),
        accept_minor: Joi.number().integer().min(0).optional().allow(null),
        reject_critical: Joi.number().integer().min(0).optional().allow(null),
        reject_major: Joi.number().integer().min(0).optional().allow(null),
        reject_minor: Joi.number().integer().min(0).optional().allow(null),
        qc_template_id: Joi.string().uuid().optional().allow(null),
        is_active: Joi.boolean().optional(),
        valid_from: Joi.date().optional(),
        valid_to: Joi.date().optional().allow(null),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        product_id: Joi.string().uuid().optional(),
        is_active: Joi.boolean().optional(),
        sortBy: Joi.string().valid('created_at', 'valid_from', 'level').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    addDefectType: Joi.object({
        defect_type_id: Joi.string().uuid().required()
    })
};

module.exports = { levelInspectionValidation };
