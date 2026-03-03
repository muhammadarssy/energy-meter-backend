const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { assemblyValidation } = require('../validations/assemblyValidation');
const assemblyService = require('../services/assemblyService');

// ─── PLN Orders ───────────────────────────────────────────────────────────────

const getAllPlnOrders = [
    validate(assemblyValidation.plnOrder.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await assemblyService.getAllPlnOrders(req.query);
        return success.ok(res, 'PLN orders retrieved', result.data, result.meta);
    })
];

const getPlnOrderById = asyncHandler(async (req, res) => {
    const item = await assemblyService.getPlnOrderById(req.params.id);
    if (!item) return error.notFound(res, 'PLN order not found');
    return success.ok(res, 'PLN order retrieved', item);
});

const createPlnOrder = [
    validate(assemblyValidation.plnOrder.create),
    asyncHandler(async (req, res) => {
        const item = await assemblyService.createPlnOrder(req.body);
        return success.created(res, 'PLN order created', item);
    })
];

const updatePlnOrder = [
    validate(assemblyValidation.plnOrder.update),
    asyncHandler(async (req, res) => {
        const item = await assemblyService.getPlnOrderById(req.params.id);
        if (!item) return error.notFound(res, 'PLN order not found');
        const updated = await assemblyService.updatePlnOrder(req.params.id, req.body);
        return success.updated(res, 'PLN order updated', updated);
    })
];

// ─── Assembly Orders ──────────────────────────────────────────────────────────

const getAllAssemblyOrders = [
    validate(assemblyValidation.assemblyOrder.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await assemblyService.getAllAssemblyOrders(req.query);
        return success.ok(res, 'Assembly orders retrieved', result.data, result.meta);
    })
];

const getAssemblyOrderById = asyncHandler(async (req, res) => {
    const item = await assemblyService.getAssemblyOrderById(req.params.id);
    if (!item) return error.notFound(res, 'Assembly order not found');
    return success.ok(res, 'Assembly order retrieved', item);
});

const createAssemblyOrder = [
    validate(assemblyValidation.assemblyOrder.create),
    asyncHandler(async (req, res) => {
        const item = await assemblyService.createAssemblyOrder(req.body);
        return success.created(res, 'Assembly order created', item);
    })
];

const updateAssemblyOrder = [
    validate(assemblyValidation.assemblyOrder.update),
    asyncHandler(async (req, res) => {
        const item = await assemblyService.getAssemblyOrderById(req.params.id);
        if (!item) return error.notFound(res, 'Assembly order not found');
        const updated = await assemblyService.updateAssemblyOrder(req.params.id, req.body);
        return success.updated(res, 'Assembly order updated', updated);
    })
];

const deleteAssemblyOrder = asyncHandler(async (req, res) => {
    const item = await assemblyService.getAssemblyOrderById(req.params.id);
    if (!item) return error.notFound(res, 'Assembly order not found');
    await assemblyService.softDeleteAssemblyOrder(req.params.id);
    return success.deleted(res, 'Assembly order deleted');
});

// ─── Assembly Order Items ─────────────────────────────────────────────────────

const getItemsByOrder = asyncHandler(async (req, res) => {
    const items = await assemblyService.getItemsByOrder(req.params.orderId);
    return success.ok(res, 'Assembly order items retrieved', items);
});

const addItem = [
    validate(assemblyValidation.assemblyItem.create),
    asyncHandler(async (req, res) => {
        const item = await assemblyService.addItem(req.params.orderId, req.body);
        return success.created(res, 'Item added to assembly order', item);
    })
];

const addItemsBulk = [
    validate(assemblyValidation.assemblyItem.createBulk),
    asyncHandler(async (req, res) => {
        const items = await assemblyService.addItemsBulk(req.params.orderId, req.body.items);
        return success.created(res, `${items.length} items added`, items);
    })
];

const updateItem = [
    validate(assemblyValidation.assemblyItem.update),
    asyncHandler(async (req, res) => {
        const updated = await assemblyService.updateItem(req.params.itemId, req.body);
        return success.updated(res, 'Item updated', updated);
    })
];

const deleteItem = asyncHandler(async (req, res) => {
    await assemblyService.deleteItem(req.params.itemId);
    return success.deleted(res, 'Item deleted');
});

// ─── Confirmations ────────────────────────────────────────────────────────────

const getConfirmations = asyncHandler(async (req, res) => {
    const items = await assemblyService.getConfirmationsByOrder(req.params.orderId);
    return success.ok(res, 'Confirmations retrieved', items);
});

const confirmItem = [
    validate(assemblyValidation.confirmItem),
    asyncHandler(async (req, res) => {
        const result = await assemblyService.confirmItem(req.params.orderId, req.body);
        return success.created(res, 'Component confirmed — stock reserved', result);
    })
];

const startOrder = asyncHandler(async (req, res) => {
    const order = await assemblyService.getAssemblyOrderById(req.params.orderId);
    if (!order) return error.notFound(res, 'Assembly order not found');
    if (order.status !== 'pending') {
        return error.badRequest(res, `Order is already ${order.status}`);
    }
    const updated = await assemblyService.startAssemblyOrder(req.params.orderId);
    return success.updated(res, 'Assembly order started', updated);
});

// ─── Process Assembly ─────────────────────────────────────────────────────────

const processAssembly = [
    validate(assemblyValidation.process),
    asyncHandler(async (req, res) => {
        const order = await assemblyService.getAssemblyOrderById(req.params.orderId);
        if (!order) return error.notFound(res, 'Assembly order not found');
        if (order.status !== 'in_progress') {
            return error.badRequest(res, 'Assembly order must be in_progress before processing');
        }
        const result = await assemblyService.processAssembly(req.params.orderId, req.body);
        return success.created(res, 'Assembly processed — tracking created', result);
    })
];

const completeOrder = asyncHandler(async (req, res) => {
    const order = await assemblyService.getAssemblyOrderById(req.params.orderId);
    if (!order) return error.notFound(res, 'Assembly order not found');
    const updated = await assemblyService.completeAssemblyOrder(req.params.orderId);
    return success.updated(res, 'Assembly order completed', updated);
});

module.exports = {
    getAllPlnOrders, getPlnOrderById, createPlnOrder, updatePlnOrder,
    getAllAssemblyOrders, getAssemblyOrderById, createAssemblyOrder, updateAssemblyOrder, deleteAssemblyOrder,
    getItemsByOrder, addItem, addItemsBulk, updateItem, deleteItem,
    getConfirmations, confirmItem, startOrder,
    processAssembly, completeOrder
};
