const Joi = require('joi');

const commonQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).allow('').optional(),
    is_active: Joi.boolean().optional()
});

const productMasterValidation = {
    supplier: {
        create: Joi.object({
            code: Joi.string().trim().max(50).required(),
            name: Joi.string().trim().max(255).required(),
            contact_name: Joi.string().max(255).optional().allow('', null),
            contact_email: Joi.string().email().max(255).optional().allow('', null),
            contact_phone: Joi.string().max(50).optional().allow('', null),
            address: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().default(true)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(50).optional(),
            name: Joi.string().trim().max(255).optional(),
            contact_name: Joi.string().max(255).optional().allow('', null),
            contact_email: Joi.string().email().max(255).optional().allow('', null),
            contact_phone: Joi.string().max(50).optional().allow('', null),
            address: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().optional()
        }).min(1),
        query: commonQuery
    },

    productType: {
        create: Joi.object({
            code: Joi.string().trim().max(50).required(),
            name: Joi.string().trim().max(255).required(),
            description: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().default(true)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(50).optional(),
            name: Joi.string().trim().max(255).optional(),
            description: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().optional()
        }).min(1),
        query: commonQuery
    },

    productCategory: {
        create: Joi.object({
            code: Joi.string().trim().max(50).required(),
            name: Joi.string().trim().max(255).required(),
            description: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().default(true)
        }),
        update: Joi.object({
            code: Joi.string().trim().max(50).optional(),
            name: Joi.string().trim().max(255).optional(),
            description: Joi.string().optional().allow('', null),
            is_active: Joi.boolean().optional()
        }).min(1),
        query: commonQuery
    }
};

module.exports = { productMasterValidation };
