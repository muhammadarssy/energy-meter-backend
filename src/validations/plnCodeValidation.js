const Joi = require('joi');

const plnCodeValidation = {
    // ─── Master Data ──────────────────────────────────────────────────────────

    materialGroup: {
        create: Joi.object({
            code: Joi.string().trim().max(2).required(),
            name: Joi.string().trim().max(255).required(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().default(true),
            is_default: Joi.boolean().default(false)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(2).optional(),
            name: Joi.string().trim().max(255).optional(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().optional(),
            is_default: Joi.boolean().optional()
        }).min(1)
    },

    materialSubGroup: {
        create: Joi.object({
            material_group_id: Joi.string().uuid().required(),
            code: Joi.string().trim().max(2).required(),
            name: Joi.string().trim().max(255).required(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().default(true),
            is_default: Joi.boolean().default(false)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(2).optional(),
            name: Joi.string().trim().max(255).optional(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().optional(),
            is_default: Joi.boolean().optional()
        }).min(1)
    },

    variant: {
        create: Joi.object({
            code: Joi.string().trim().max(7).required(),
            name: Joi.string().trim().max(255).required(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().default(true),
            is_default: Joi.boolean().default(false)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(7).optional(),
            name: Joi.string().trim().max(255).optional(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().optional(),
            is_default: Joi.boolean().optional()
        }).min(1)
    },

    factory: {
        create: Joi.object({
            code: Joi.string().trim().max(4).required(),
            name: Joi.string().trim().max(255).required(),
            location: Joi.string().trim().max(255).allow('', null).optional(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().default(true),
            is_default: Joi.boolean().default(false)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(4).optional(),
            name: Joi.string().trim().max(255).optional(),
            location: Joi.string().trim().max(255).allow('', null).optional(),
            description: Joi.string().allow('', null).optional(),
            is_active: Joi.boolean().optional(),
            is_default: Joi.boolean().optional()
        }).min(1)
    },

    // ─── PLN Code Operations ──────────────────────────────────────────────────

    generatePartial: Joi.object({
        factory_id: Joi.string().uuid().required(),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().allow('', null).optional(),
        created_by_id: Joi.string().uuid().optional().allow(null)
    }),

    bulkGeneratePartial: Joi.object({
        factory_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).max(1000).required(),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().allow('', null).optional(),
        created_by_id: Joi.string().uuid().optional().allow(null)
    }),

    addMaterialInfo: Joi.object({
        material_group_id: Joi.string().uuid().required(),
        material_sub_group_id: Joi.string().uuid().required(),
        variant_id: Joi.string().uuid().required()
    }),

    generateComplete: Joi.object({
        factory_id: Joi.string().uuid().required(),
        material_group_id: Joi.string().uuid().required(),
        material_sub_group_id: Joi.string().uuid().required(),
        variant_id: Joi.string().uuid().required(),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().allow('', null).optional(),
        created_by_id: Joi.string().uuid().optional().allow(null)
    }),

    bulkGenerateComplete: Joi.object({
        factory_id: Joi.string().uuid().required(),
        material_group_id: Joi.string().uuid().required(),
        material_sub_group_id: Joi.string().uuid().required(),
        variant_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).max(1000).required(),
        assembly_order_id: Joi.string().uuid().optional().allow(null),
        notes: Joi.string().allow('', null).optional(),
        created_by_id: Joi.string().uuid().optional().allow(null)
    }),

    markAsLasered: Joi.object({
        lasered_by_id: Joi.string().uuid().optional().allow(null),
        laser_notes: Joi.string().allow('', null).optional()
    }),

    bulkMarkAsLasered: Joi.object({
        pln_code_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
        lasered_by_id: Joi.string().uuid().optional().allow(null),
        laser_notes: Joi.string().allow('', null).optional()
    }),

    markAsPrinted: Joi.object({
        printed_by_id: Joi.string().uuid().optional().allow(null),
        print_notes: Joi.string().allow('', null).optional()
    }),

    bulkMarkAsPrinted: Joi.object({
        pln_code_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
        printed_by_id: Joi.string().uuid().optional().allow(null),
        print_notes: Joi.string().allow('', null).optional()
    }),

    validate: Joi.object({
        full_code: Joi.string().required()
    }),

    createBox: Joi.object({
        assembly_order_id: Joi.string().uuid().required(),
        capacity: Joi.number().integer().min(1).max(1000).default(12),
        notes: Joi.string().allow('', null).optional(),
        created_by_id: Joi.string().uuid().optional().allow(null)
    }),

    assignToBox: Joi.object({
        pln_code_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
        box_id: Joi.string().uuid().required()
    }),

    sealBox: Joi.object({
        sealed_by_id: Joi.string().uuid().optional().allow(null)
    }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().valid('PARTIAL', 'MATERIAL_SELECTED', 'LASERED', 'PRINTED', 'BOXED', 'COMPLETED').optional(),
        factory_id: Joi.string().uuid().optional(),
        is_lasered: Joi.boolean().optional(),
        is_printed: Joi.boolean().optional(),
        assembly_order_id: Joi.string().uuid().optional()
    })
};

module.exports = { plnCodeValidation };
