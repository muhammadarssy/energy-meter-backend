const Joi = require('joi');

const serialStagingValidation = {
    scan: Joi.object({
        serial_number: Joi.string().trim().max(100).required().messages({
            'string.empty': 'Serial number is required',
            'any.required': 'Serial number is required'
        }),
        scanned_by: Joi.string().uuid().optional().allow(null)
    }),

    scanBulk: Joi.object({
        serial_numbers: Joi.array().items(Joi.string().trim().max(100)).min(1).required().messages({
            'array.min': 'At least one serial number is required',
            'any.required': 'serial_numbers is required'
        }),
        scanned_by: Joi.string().uuid().optional().allow(null)
    })
};

module.exports = { serialStagingValidation };
