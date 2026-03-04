const Joi = require('joi');

// ─── Level Inspection schema (inline saat create/update product) ───────────────
const levelInspectionInlineSchema = Joi.object({
    level: Joi.string().valid('I', 'II', 'III').required(),
    aql_critical: Joi.number().min(0).required(),
    aql_major: Joi.number().min(0).required(),
    aql_minor: Joi.number().min(0).required(),
    sample_size: Joi.number().integer().min(1).optional().allow(null),
    accept_critical: Joi.number().integer().min(0).optional().allow(null),
    accept_major: Joi.number().integer().min(0).optional().allow(null),
    accept_minor: Joi.number().integer().min(0).optional().allow(null),
    reject_critical: Joi.number().integer().min(0).optional().allow(null),
    reject_major: Joi.number().integer().min(0).optional().allow(null),
    reject_minor: Joi.number().integer().min(0).optional().allow(null),
    qc_template_id: Joi.string().uuid().optional().allow(null),
    is_active: Joi.boolean().default(true),
    valid_from: Joi.date().optional().allow(null),
    valid_to: Joi.date().optional().allow(null),
    notes: Joi.string().max(500).optional().allow('', null)
});

const productValidation = {
    create: Joi.object({
        // Core fields
        sap_code: Joi.string().trim().max(100).required(),
        name: Joi.string().trim().max(255).required(),
        description: Joi.string().allow('', null).optional(),
        product_type_id: Joi.string().uuid().required(),
        supplier_id: Joi.string().uuid().required(),
        is_serialize: Joi.boolean().default(true),
        is_qc: Joi.boolean().default(true),
        is_active: Joi.boolean().default(true),
        qc_product: Joi.string().max(100).optional().allow('', null),
        image_url: Joi.string().max(500).optional().allow('', null),

        // Inline relations
        category_ids: Joi.array().items(Joi.string().uuid()).optional().default([]),
        level_inspections: Joi.array().items(levelInspectionInlineSchema).optional().default([])
    }),

    update: Joi.object({
        sap_code: Joi.string().trim().max(100).optional(),
        name: Joi.string().trim().max(255).optional(),
        description: Joi.string().allow('', null).optional(),
        product_type_id: Joi.string().uuid().optional(),
        supplier_id: Joi.string().uuid().optional(),
        is_serialize: Joi.boolean().optional(),
        is_qc: Joi.boolean().optional(),
        is_active: Joi.boolean().optional(),
        qc_product: Joi.string().max(100).optional().allow('', null),
        image_url: Joi.string().max(500).optional().allow('', null),

        // When provided, replaces all existing category mappings
        category_ids: Joi.array().items(Joi.string().uuid()).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().max(255).allow('').optional(),
        product_type_id: Joi.string().uuid().optional(),
        supplier_id: Joi.string().uuid().optional(),
        is_active: Joi.boolean().optional(),
        is_serialize: Joi.boolean().optional(),
        is_qc: Joi.boolean().optional()
    }),

    addLevelInspection: levelInspectionInlineSchema,

    updateLevelInspection: Joi.object({
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
        qc_template_id: Joi.string().uuid().optional().allow(null),
        is_active: Joi.boolean().optional(),
        valid_from: Joi.date().optional().allow(null),
        valid_to: Joi.date().optional().allow(null),
        notes: Joi.string().max(500).optional().allow('', null)
    }).min(1)
};

module.exports = { productValidation };
