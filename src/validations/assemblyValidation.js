const Joi = require('joi');

const assemblyValidation = {
    plnOrder: {
        create: Joi.object({
            order_number: Joi.string().trim().max(100).required(),
            customer_name: Joi.string().max(255).allow('', null).optional(),
            notes: Joi.string().max(1000).allow('', null).optional()
        }),
        update: Joi.object({
            order_number: Joi.string().trim().max(100).optional(),
            customer_name: Joi.string().max(255).allow('', null).optional(),
            notes: Joi.string().max(1000).allow('', null).optional()
        }).min(1),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            search: Joi.string().max(255).allow('').optional()
        })
    },

    assemblyOrder: {
        create: Joi.object({
            product_id: Joi.string().uuid().required(),
            quantity: Joi.number().integer().min(1).required(),
            pln_order_id: Joi.string().uuid().optional().allow(null),
            notes: Joi.string().max(1000).allow('', null).optional()
        }),
        update: Joi.object({
            quantity: Joi.number().integer().min(1).optional(),
            pln_order_id: Joi.string().uuid().optional().allow(null),
            notes: Joi.string().max(1000).allow('', null).optional(),
            status: Joi.string().valid('pending', 'in_progress', 'partial', 'completed', 'failed').optional()
        }).min(1),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            status: Joi.string().valid('pending', 'in_progress', 'partial', 'completed', 'failed').optional(),
            product_id: Joi.string().uuid().optional()
        })
    },

    assemblyItem: {
        create: Joi.object({
            component_id: Joi.string().uuid().required(),
            quantity: Joi.number().integer().min(1).required(),
            notes: Joi.string().max(500).allow('', null).optional()
        }),
        createBulk: Joi.object({
            items: Joi.array().items(
                Joi.object({
                    component_id: Joi.string().uuid().required(),
                    quantity: Joi.number().integer().min(1).required(),
                    notes: Joi.string().max(500).allow('', null).optional()
                })
            ).min(1).required()
        }),
        update: Joi.object({
            quantity: Joi.number().integer().min(1).optional(),
            notes: Joi.string().max(500).allow('', null).optional()
        }).min(1)
    },

    confirmItem: Joi.object({
        component_id: Joi.string().uuid().required(),
        stock_unit_id: Joi.string().uuid().required(),
        qty_confirmed: Joi.number().integer().min(1).required()
    }),

    process: Joi.object({
        pln_code_id: Joi.string().uuid().optional().allow(null),
        components: Joi.array().items(
            Joi.object({
                component_tracking_id: Joi.string().uuid().required(),
                quantity: Joi.number().integer().min(1).default(1)
            })
        ).optional().default([])
    })
};

module.exports = { assemblyValidation };
