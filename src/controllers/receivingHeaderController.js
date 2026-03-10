const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { receivingHeaderValidation } = require('../validations/receivingHeaderValidation');
const receivingHeaderService = require('../services/receivingHeaderService');
const batchService = require('../services/batchService');

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
        const { gr_number } = req.body;

        // Auto-generate batch code unik: tanggal + 5 char random
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
        const batch = await batchService.create({ code: `BATCH-${dateStr}-${rand}` });

        const item = await receivingHeaderService.create({
            ...req.body,
            batch_id: batch.id,
            received_by: req.user.id
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

// ─── Confirmations ────────────────────────────────────────────────────────────

const getConfirmations = asyncHandler(async (req, res) => {
    const header = await receivingHeaderService.getById(req.params.headerId);
    if (!header) return error.notFound(res, 'Receiving header not found');
    const items = await receivingHeaderService.getConfirmationsByHeader(req.params.headerId);
    return success.ok(res, 'Confirmations retrieved', items);
});

const confirm = [
    validate(receivingHeaderValidation.confirm),
    asyncHandler(async (req, res) => {
        const header = await receivingHeaderService.getById(req.params.headerId);
        if (!header) return error.notFound(res, 'Receiving header not found');
        try {
            const result = await receivingHeaderService.confirm(req.params.headerId, {
                ...req.body,
                confirmed_by: req.user?.id ?? req.body.confirmed_by
            });
            return success.created(res, 'Receiving confirmed', result);
        } catch (err) {
            if (err.code === 'TRACKING_EXISTS') return error.conflict(res, err.message);
            if (err.code === 'SERIAL_INCOMPLETE') return error.badRequest(res, err.message);
            throw err;
        }
    })
];

module.exports = { getAll, getById, create, update, remove, getConfirmations, confirm };
