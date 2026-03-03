const Joi = require('joi');

const authValidation = {
    login: Joi.object({
        login: Joi.string().required(), // username or email
        password: Joi.string().required()
    }),

    register: Joi.object({
        name: Joi.string().trim().max(255).required(),
        username: Joi.string().trim().alphanum().min(3).max(50).optional().allow(null),
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(6).max(100).required(),
        department: Joi.string().max(100).optional().allow('', null)
    }),

    changePassword: Joi.object({
        current_password: Joi.string().required(),
        new_password: Joi.string().min(6).max(100).required()
    }),

    user: {
        create: Joi.object({
            name: Joi.string().trim().max(255).required(),
            username: Joi.string().trim().alphanum().min(3).max(50).optional().allow(null),
            email: Joi.string().email().max(255).required(),
            password: Joi.string().min(6).max(100).required(),
            department: Joi.string().max(100).optional().allow('', null),
            is_active: Joi.boolean().default(true)
        }),
        update: Joi.object({
            name: Joi.string().trim().max(255).optional(),
            username: Joi.string().trim().alphanum().min(3).max(50).optional().allow(null),
            email: Joi.string().email().max(255).optional(),
            department: Joi.string().max(100).optional().allow('', null),
            is_active: Joi.boolean().optional()
        }).min(1),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            search: Joi.string().max(255).allow('').optional(),
            department: Joi.string().max(100).optional(),
            is_active: Joi.boolean().optional()
        }),
        assignRoles: Joi.object({
            role_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
        }),
        assignPermissions: Joi.object({
            permission_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
        })
    },

    role: {
        create: Joi.object({
            name: Joi.string().trim().max(100).required(),
            description: Joi.string().max(500).allow('', null).optional(),
            is_active: Joi.boolean().default(true)
        }),
        update: Joi.object({
            name: Joi.string().trim().max(100).optional(),
            description: Joi.string().max(500).allow('', null).optional(),
            is_active: Joi.boolean().optional()
        }).min(1),
        assignPermissions: Joi.object({
            permission_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
        })
    },

    permission: {
        create: Joi.object({
            name: Joi.string().trim().max(100).required()
        }),
        update: Joi.object({
            name: Joi.string().trim().max(100).required()
        })
    }
};

module.exports = { authValidation };
