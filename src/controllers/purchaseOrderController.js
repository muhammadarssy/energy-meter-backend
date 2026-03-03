const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { purchaseOrderValidation } = require('../validations/purchaseOrderValidation');
const purchaseOrderService = require('../services/purchaseOrderService');

const getAll = [
    validate(purchaseOrderValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await purchaseOrderService.getAll(req.query);
        return success.ok(res, 'Purchase orders retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await purchaseOrderService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Purchase order not found');
    return success.ok(res, 'Purchase order retrieved', item);
});

const create = [
    validate(purchaseOrderValidation.create),
    asyncHandler(async (req, res) => {
        const item = await purchaseOrderService.create(req.body);
        return success.created(res, 'Purchase order created', item);
    })
];

const update = [
    validate(purchaseOrderValidation.update),
    asyncHandler(async (req, res) => {
        const item = await purchaseOrderService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Purchase order not found');
        const updated = await purchaseOrderService.update(req.params.id, req.body);
        return success.updated(res, 'Purchase order updated', updated);
    })
];

const remove = asyncHandler(async (req, res) => {
    const item = await purchaseOrderService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Purchase order not found');
    await purchaseOrderService.softDelete(req.params.id);
    return success.deleted(res, 'Purchase order deleted');
});

module.exports = { getAll, getById, create, update, remove };
