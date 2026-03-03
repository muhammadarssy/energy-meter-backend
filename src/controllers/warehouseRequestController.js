const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { warehouseRequestValidation } = require('../validations/warehouseRequestValidation');
const warehouseRequestService = require('../services/warehouseRequestService');

const getAll = [
    validate(warehouseRequestValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await warehouseRequestService.getAll(req.query);
        return success.ok(res, 'Warehouse requests retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await warehouseRequestService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Warehouse request not found');
    return success.ok(res, 'Warehouse request retrieved', item);
});

const create = [
    validate(warehouseRequestValidation.create),
    asyncHandler(async (req, res) => {
        const item = await warehouseRequestService.create(req.body);
        return success.created(res, 'Warehouse request created', item);
    })
];

// PATCH /warehouse-requests/:id/approve
const approve = [
    validate(warehouseRequestValidation.approve),
    asyncHandler(async (req, res) => {
        const item = await warehouseRequestService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Warehouse request not found');
        if (item.status !== 'pending') {
            return error.badRequest(res, `Request is already ${item.status}`);
        }

        let result;
        if (item.request_type === 'inbound_receiving') {
            result = await warehouseRequestService.approveInboundReceiving(req.params.id, req.body.approved_by);
        } else if (item.request_type === 'inbound_assembly') {
            result = await warehouseRequestService.approveInboundAssembly(req.params.id, req.body.approved_by);
        } else {
            return error.badRequest(res, 'Unknown request type');
        }

        return success.updated(res, 'Warehouse request approved — stock updated', result);
    })
];

// PATCH /warehouse-requests/:id/reject
const reject = [
    validate(warehouseRequestValidation.reject),
    asyncHandler(async (req, res) => {
        const item = await warehouseRequestService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Warehouse request not found');
        if (item.status !== 'pending') {
            return error.badRequest(res, `Request is already ${item.status}`);
        }
        const updated = await warehouseRequestService.reject(req.params.id, req.body.rejected_by, req.body.reason);
        return success.updated(res, 'Warehouse request rejected', updated);
    })
];

module.exports = { getAll, getById, create, approve, reject };
