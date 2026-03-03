const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { receivingItemValidation } = require('../validations/receivingItemValidation');
const receivingItemService = require('../services/receivingItemService');

// GET /receiving-headers/:headerId/items
const getByHeader = asyncHandler(async (req, res) => {
    const items = await receivingItemService.getByHeader(req.params.headerId);
    return success.ok(res, 'Receiving items retrieved', items);
});

// GET /receiving-items/:id  (standalone route)
const getById = asyncHandler(async (req, res) => {
    const item = await receivingItemService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Receiving item not found');
    return success.ok(res, 'Receiving item retrieved', item);
});

// POST /receiving-headers/:headerId/items
const create = [
    validate(receivingItemValidation.create),
    asyncHandler(async (req, res) => {
        const item = await receivingItemService.create(req.params.headerId, req.body);
        return success.created(res, 'Receiving item created', item);
    })
];

// POST /receiving-headers/:headerId/items/bulk
const createBulk = [
    validate(receivingItemValidation.createBulk),
    asyncHandler(async (req, res) => {
        const items = await receivingItemService.createBulk(req.params.headerId, req.body.items);
        return success.created(res, `${items.length} receiving items created`, items);
    })
];

// PATCH /receiving-items/:id
const update = [
    validate(receivingItemValidation.update),
    asyncHandler(async (req, res) => {
        const item = await receivingItemService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Receiving item not found');
        const updated = await receivingItemService.update(req.params.id, req.body);
        return success.updated(res, 'Receiving item updated', updated);
    })
];

// DELETE /receiving-items/:id
const remove = asyncHandler(async (req, res) => {
    const item = await receivingItemService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Receiving item not found');
    await receivingItemService.delete(req.params.id);
    return success.deleted(res, 'Receiving item deleted');
});

module.exports = { getByHeader, getById, create, createBulk, update, remove };
