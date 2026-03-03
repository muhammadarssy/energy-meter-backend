const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { receivingHeaderValidation } = require('../validations/receivingHeaderValidation');
const receivingHeaderService = require('../services/receivingHeaderService');

const getAll = [
    validate(receivingHeaderValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await receivingHeaderService.getAll(req.query);
        return success.ok(res, 'Receiving headers retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await receivingHeaderService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Receiving header not found');
    return success.ok(res, 'Receiving header retrieved', item);
});

const create = [
    validate(receivingHeaderValidation.create),
    asyncHandler(async (req, res) => {
        const item = await receivingHeaderService.create({
            ...req.body,
            status: 'pending'
        });
        return success.created(res, 'Receiving header created', item);
    })
];

const update = [
    validate(receivingHeaderValidation.update),
    asyncHandler(async (req, res) => {
        const item = await receivingHeaderService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Receiving header not found');
        const updated = await receivingHeaderService.update(req.params.id, req.body);
        return success.updated(res, 'Receiving header updated', updated);
    })
];

const remove = asyncHandler(async (req, res) => {
    const item = await receivingHeaderService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Receiving header not found');
    await receivingHeaderService.softDelete(req.params.id);
    return success.deleted(res, 'Receiving header deleted');
});

module.exports = { getAll, getById, create, update, remove };
