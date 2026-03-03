const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { plnCodeValidation } = require('../validations/plnCodeValidation');
const plnCodeService = require('../services/plnCodeService');

// ─── Generate ─────────────────────────────────────────────────────────────────

const generatePartial = [
    validate(plnCodeValidation.generatePartial),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.generatePartial(req.body);
        return success.created(res, 'PLN code generated (partial)', result);
    })
];

const bulkGeneratePartial = [
    validate(plnCodeValidation.bulkGeneratePartial),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.bulkGeneratePartial(req.body);
        return success.created(res, `${result.generated} PLN codes generated (partial)`, result);
    })
];

const addMaterialInfo = [
    validate(plnCodeValidation.addMaterialInfo),
    asyncHandler(async (req, res) => {
        try {
            const result = await plnCodeService.addMaterialInfo(req.params.id, req.body);
            return success.updated(res, 'Material info added — code is MATERIAL_SELECTED', result);
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

const generateComplete = [
    validate(plnCodeValidation.generateComplete),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.generateComplete(req.body);
        return success.created(res, 'PLN code generated (complete)', result);
    })
];

const bulkGenerateComplete = [
    validate(plnCodeValidation.bulkGenerateComplete),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.bulkGenerateComplete(req.body);
        return success.created(res, `${result.generated} PLN codes generated (complete)`, result);
    })
];

// ─── Laser / Print ────────────────────────────────────────────────────────────

const markAsLasered = [
    validate(plnCodeValidation.markAsLasered),
    asyncHandler(async (req, res) => {
        try {
            const result = await plnCodeService.markAsLasered(req.params.id, req.body);
            return success.updated(res, 'PLN code marked as lasered', result);
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

const bulkMarkAsLasered = [
    validate(plnCodeValidation.bulkMarkAsLasered),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.bulkMarkAsLasered(req.body);
        return success.updated(res, `${result.count} PLN codes marked as lasered`, result);
    })
];

const markAsPrinted = [
    validate(plnCodeValidation.markAsPrinted),
    asyncHandler(async (req, res) => {
        try {
            const result = await plnCodeService.markAsPrinted(req.params.id, req.body);
            return success.updated(res, 'PLN code marked as printed', result);
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

const bulkMarkAsPrinted = [
    validate(plnCodeValidation.bulkMarkAsPrinted),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.bulkMarkAsPrinted(req.body);
        return success.updated(res, `${result.count} PLN codes marked as printed`, result);
    })
];

// ─── Validate ─────────────────────────────────────────────────────────────────

const validateCode = [
    validate(plnCodeValidation.validate),
    asyncHandler(async (req, res) => {
        const result = plnCodeService.validateCode(req.body.full_code);
        return success.ok(res, result.is_valid ? 'Code is valid' : 'Code is invalid', result);
    })
];

// ─── Box Management ───────────────────────────────────────────────────────────

const getBoxes = asyncHandler(async (req, res) => {
    const result = await plnCodeService.getBoxes(req.query);
    return success.ok(res, 'Boxes retrieved', result.data, result.meta);
});

const getBoxById = asyncHandler(async (req, res) => {
    const box = await plnCodeService.getBoxById(req.params.id);
    if (!box) return error.notFound(res, 'Box not found');
    return success.ok(res, 'Box retrieved', box);
});

const createBox = [
    validate(plnCodeValidation.createBox),
    asyncHandler(async (req, res) => {
        const box = await plnCodeService.createBox(req.body);
        return success.created(res, 'Box created', box);
    })
];

const assignToBox = [
    validate(plnCodeValidation.assignToBox),
    asyncHandler(async (req, res) => {
        try {
            const result = await plnCodeService.assignToBox(req.body);
            return success.updated(res, `${result.count} codes assigned to box`, result);
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

const sealBox = [
    validate(plnCodeValidation.sealBox),
    asyncHandler(async (req, res) => {
        try {
            const result = await plnCodeService.sealBox(req.params.id, req.body);
            return success.updated(res, 'Box sealed', result);
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

// ─── Queries ──────────────────────────────────────────────────────────────────

const getAll = [
    validate(plnCodeValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await plnCodeService.getAll(req.query);
        return success.ok(res, 'PLN codes retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await plnCodeService.getById(req.params.id);
    if (!item) return error.notFound(res, 'PLN code not found');
    return success.ok(res, 'PLN code retrieved', item);
});

const getByFullCode = asyncHandler(async (req, res) => {
    const item = await plnCodeService.getByFullCode(req.params.code);
    if (!item) return error.notFound(res, 'PLN code not found');
    return success.ok(res, 'PLN code retrieved', item);
});

const getUnlasered = asyncHandler(async (req, res) => {
    const result = await plnCodeService.getUnlasered(req.query);
    return success.ok(res, 'Unlasered codes retrieved', result.data, result.meta);
});

const getUnprinted = asyncHandler(async (req, res) => {
    const result = await plnCodeService.getUnprinted(req.query);
    return success.ok(res, 'Unprinted codes retrieved', result.data, result.meta);
});

module.exports = {
    generatePartial, bulkGeneratePartial, addMaterialInfo,
    generateComplete, bulkGenerateComplete,
    markAsLasered, bulkMarkAsLasered,
    markAsPrinted, bulkMarkAsPrinted,
    validateCode,
    getBoxes, getBoxById, createBox, assignToBox, sealBox,
    getAll, getById, getByFullCode, getUnlasered, getUnprinted
};
