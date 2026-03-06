const Joi = require('joi');

// Shared AQL + level fields untuk reuse
const liFields = {
    level: Joi.string().valid('I', 'II', 'III').messages({ 'any.only': 'Level must be I, II, or III' }),
    aql_critical: Joi.number().min(0).max(100),
    aql_major: Joi.number().min(0).max(100),
    aql_minor: Joi.number().min(0).max(100),
    sample_size: Joi.number().integer().min(1).optional().allow(null),
    accept_critical: Joi.number().integer().min(0).optional().allow(null),
    accept_major: Joi.number().integer().min(0).optional().allow(null),
    accept_minor: Joi.number().integer().min(0).optional().allow(null),
    reject_critical: Joi.number().integer().min(0).optional().allow(null),
    reject_major: Joi.number().integer().min(0).optional().allow(null),
    reject_minor: Joi.number().integer().min(0).optional().allow(null),
    is_active: Joi.boolean(),
    valid_from: Joi.date().optional(),
    valid_to: Joi.date().optional().allow(null),
    notes: Joi.string().max(1000).allow('', null).optional()
};

const levelInspectionValidation = {
    // Standalone POST /level-inspections — qc_template_id wajib karena tidak ada parent di URL
    create: Joi.object({
        qc_template_id: Joi.string().uuid().required(),
        ...liFields,
        level: liFields.level.required(),
        aql_critical: liFields.aql_critical.required(),
        aql_major: liFields.aql_major.required(),
        aql_minor: liFields.aql_minor.required()
    }),

    update: Joi.object({
        ...liFields
    }).min(1),

    // PUT /qc-templates/:id/level-inspection — qc_template_id sudah ada di URL param
    templateLevel: Joi.object({
        ...liFields,
        level: liFields.level.required(),
        aql_critical: liFields.aql_critical.required(),
        aql_major: liFields.aql_major.required(),
        aql_minor: liFields.aql_minor.required()
    }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        qc_template_id: Joi.string().uuid().optional(),
        is_active: Joi.boolean().optional(),
        sortBy: Joi.string().valid('created_at', 'valid_from', 'level').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    addDefectType: Joi.object({
        defect_type_id: Joi.string().uuid().required()
    })
};

module.exports = { levelInspectionValidation };
