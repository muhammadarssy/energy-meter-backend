const Joi = require('joi');

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
        category_ids: Joi.array().items(Joi.string().uuid()).optional().default([])
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

    // POST /products/:id/level-inspections — assign existing QC template to this product
    addLevelInspection: Joi.object({
        qc_template_id: Joi.string().uuid().required()
    })
};

module.exports = { productValidation };

