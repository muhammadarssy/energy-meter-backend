const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { trackingValidation } = require('../validations/trackingValidation');
const trackingService = require('../services/trackingService');

const getAll = [
    validate(trackingValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await trackingService.getAll(req.query);
        return success.ok(res, 'Tracking items retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await trackingService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Tracking item not found');
    return success.ok(res, 'Tracking item retrieved', item);
});

const create = [
    validate(trackingValidation.create),
    asyncHandler(async (req, res) => {
        const item = await trackingService.create({ ...req.body, status: 'created' });
        return success.created(res, 'Tracking item created', item);
    })
];

// POST /api/tracking/from-receiving-item/:itemId
const createFromReceivingItem = asyncHandler(async (req, res) => {
    const item = await trackingService.createFromReceivingItem(req.params.itemId);
    return success.created(res, 'Tracking item created from receiving item', item);
});

const updateStatus = [
    validate(trackingValidation.updateStatus),
    asyncHandler(async (req, res) => {
        const item = await trackingService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Tracking item not found');
        const updated = await trackingService.updateStatus(req.params.id, req.body.status);
        return success.updated(res, 'Tracking status updated', updated);
    })
];

module.exports = { getAll, getById, create, createFromReceivingItem, updateStatus };
