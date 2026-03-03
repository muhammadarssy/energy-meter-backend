const Joi = require('joi');

const defectItem = Joi.object({
    defect_type_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).default(1),
    notes: Joi.string().max(500).allow('', null).optional()
});

const qcResultValidation = {
    create: Joi.object({
        tracking_id: Joi.string().uuid().required(),
        inspector_by: Joi.string().uuid().required(),
        sample_inspection_id: Joi.string().uuid().optional().allow(null),
        qc_template_id: Joi.string().uuid().optional().allow(null),
        qc_place: Joi.string().max(255).optional().allow(''),
        notes: Joi.string().max(1000).allow('', null).optional(),
        defects: Joi.array().items(defectItem).optional().default([]),
        entity_type: Joi.string().max(50).optional(),
        entity_id: Joi.string().uuid().optional()
    }),

    addDefect: defectItem,

    updateDefect: Joi.object({
        quantity: Joi.number().integer().min(1).optional(),
        notes: Joi.string().max(500).allow('', null).optional()
    }).min(1),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        tracking_id: Joi.string().uuid().optional(),
        result: Joi.string().valid('pass', 'fail', 'conditional').optional(),
        sortBy: Joi.string().valid('inspection_date', 'created_at').default('inspection_date'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    sampleInspection: {
        create: Joi.object({
            product_id: Joi.string().uuid().required(),
            qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').required(),
            receiving_item_id: Joi.string().uuid().optional().allow(null),
            assembly_id: Joi.string().uuid().optional().allow(null),
            shipping_id: Joi.string().uuid().optional().allow(null)
        }),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            qc_phase: Joi.string().valid('receiving', 'assembly', 'shipping').optional(),
            receiving_item_id: Joi.string().uuid().optional(),
            assembly_id: Joi.string().uuid().optional()
        })
    },

    resolveStop: Joi.object({
        resolution_notes: Joi.string().max(1000).required(),
        resolved_by: Joi.string().uuid().optional().allow(null)
    }),

    productionStopQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        entity_type: Joi.string().optional(),
        entity_id: Joi.string().uuid().optional(),
        unresolved_only: Joi.boolean().optional()
    })
};

module.exports = { qcResultValidation };
