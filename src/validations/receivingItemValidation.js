const Joi = require('joi');

const itemSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    is_serialized: Joi.boolean().required(),
    quantity: Joi.number().integer().min(1).required(),
    item_type: Joi.string().valid('product', 'service', 'material').default('product'),
    notes: Joi.string().max(1000).allow('', null).optional()
});

const receivingItemValidation = {
    create: itemSchema,

    createBulk: Joi.object({
        items: Joi.array().items(itemSchema).min(1).required()
    }),

    update: Joi.object({
        product_id: Joi.string().uuid().optional(),
        is_serialized: Joi.boolean().optional(),
        quantity: Joi.number().integer().min(1).optional(),
        item_type: Joi.string().valid('product', 'service', 'material').optional(),
        notes: Joi.string().max(1000).allow('', null).optional()
    }).min(1)
};

module.exports = { receivingItemValidation };
