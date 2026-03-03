const Joi = require('joi');

const ALLOWED_ENTITY_TYPES = [
    'receiving_header', 'receiving_item',
    'qc_result',
    'assembly_order',
    'shipping_order'
];

const attachmentValidation = {
    upload: Joi.object({
        entity_type: Joi.string().valid(...ALLOWED_ENTITY_TYPES).required().messages({
            'any.only': `entity_type must be one of: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
            'any.required': 'entity_type is required'
        }),
        entity_id: Joi.string().uuid().required().messages({
            'string.guid': 'entity_id must be a valid UUID',
            'any.required': 'entity_id is required'
        }),
        description: Joi.string().max(500).allow('', null).optional(),
        uploaded_by: Joi.string().uuid().optional().allow(null)
    }),

    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        entity_type: Joi.string().valid(...ALLOWED_ENTITY_TYPES).optional(),
        entity_id: Joi.string().uuid().optional()
    })
};

module.exports = { attachmentValidation };
