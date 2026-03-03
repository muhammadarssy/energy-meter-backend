const Joi = require('joi');

const defectTypeValidation = {
    create: Joi.object({
        code: Joi.string().trim().max(50).required().messages({
            'string.empty': 'Code is required',
            'any.required': 'Code is required'
        }),
        name: Joi.string().trim().max(255).required().messages({
            'string.empty': 'Name is required',
            'any.required': 'Name is required'
        }),
        category: Joi.string().valid('critical', 'major', 'minor').required().messages({
            'any.only': 'Category must be one of: critical, major, minor',
            'any.required': 'Category is required'
        }),
        description: Joi.string().max(1000).allow('', null).optional(),
        is_active: Joi.boolean().optional().default(true)
    }),

    update: Joi.object({
        code: Joi.string().trim().max(50).optional(),
        name: Joi.string().trim().max(255).optional(),
        category: Joi.string().valid('critical', 'major', 'minor').optional(),
        description: Joi.string().max(1000).allow('', null).optional(),
        is_active: Joi.boolean().optional()
    }).min(1).messages({ 'object.min': 'At least one field is required for update' }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().max(255).allow('').optional(),
        category: Joi.string().valid('critical', 'major', 'minor').optional(),
        is_active: Joi.boolean().optional(),
        sortBy: Joi.string().valid('code', 'name', 'category', 'created_at').default('created_at'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = { defectTypeValidation };
