const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { levelInspectionValidation } = require('../validations/levelInspectionValidation');
const levelInspectionService = require('../services/levelInspectionService');

const getAll = [
    validate(levelInspectionValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await levelInspectionService.getAll(req.query);
        return success.ok(res, 'Level inspections retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await levelInspectionService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Level inspection not found');
    return success.ok(res, 'Level inspection retrieved', item);
});

// GET /level-inspections/product/:productId/active
const getActiveByProduct = asyncHandler(async (req, res) => {
    const item = await levelInspectionService.getActiveByProduct(req.params.productId);
    if (!item) return error.notFound(res, 'No active level inspection found for this product');
    return success.ok(res, 'Active level inspection retrieved', item);
});

const create = [
    validate(levelInspectionValidation.create),
    asyncHandler(async (req, res) => {
        const item = await levelInspectionService.create(req.body);
        return success.created(res, 'Level inspection created', item);
    })
];

const update = [
    validate(levelInspectionValidation.update),
    asyncHandler(async (req, res) => {
        const item = await levelInspectionService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Level inspection not found');
        const updated = await levelInspectionService.update(req.params.id, req.body);
        return success.updated(res, 'Level inspection updated', updated);
    })
];

const remove = asyncHandler(async (req, res) => {
    const item = await levelInspectionService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Level inspection not found');
    await levelInspectionService.deactivate(req.params.id);
    return success.deleted(res, 'Level inspection deactivated');
});

const addDefectType = [
    validate(levelInspectionValidation.addDefectType),
    asyncHandler(async (req, res) => {
        const item = await levelInspectionService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Level inspection not found');
        const link = await levelInspectionService.addDefectType(req.params.id, req.body.defect_type_id);
        return success.created(res, 'Defect type linked', link);
    })
];

const removeDefectType = asyncHandler(async (req, res) => {
    await levelInspectionService.removeDefectType(req.params.id, req.params.defectTypeId);
    return success.deleted(res, 'Defect type unlinked');
});

module.exports = { getAll, getById, getActiveByProduct, create, update, remove, addDefectType, removeDefectType };
