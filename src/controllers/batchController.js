const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { batchValidation } = require('../validations/batchValidation');
const batchService = require('../services/batchService');

const getAll = [
    validate(batchValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await batchService.getAll(req.query);
        return success.ok(res, 'Batches retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await batchService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Batch not found');
    return success.ok(res, 'Batch retrieved', item);
});

const create = [
    validate(batchValidation.create),
    asyncHandler(async (req, res) => {
        const item = await batchService.create(req.body);
        return success.created(res, 'Batch created', item);
    })
];

const update = [
    validate(batchValidation.update),
    asyncHandler(async (req, res) => {
        const item = await batchService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Batch not found');
        const updated = await batchService.update(req.params.id, req.body);
        return success.updated(res, 'Batch updated', updated);
    })
];

module.exports = { getAll, getById, create, update };
