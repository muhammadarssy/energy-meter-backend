const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { defectTypeValidation } = require('../validations/defectTypeValidation');
const defectTypeService = require('../services/defectTypeService');

const getAll = [
    validate(defectTypeValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await defectTypeService.getAll(req.query);
        return success.ok(res, 'Defect types retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await defectTypeService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Defect type not found');
    return success.ok(res, 'Defect type retrieved', item);
});

const create = [
    validate(defectTypeValidation.create),
    asyncHandler(async (req, res) => {
        const item = await defectTypeService.create(req.body);
        return success.created(res, 'Defect type created', item);
    })
];

const update = [
    validate(defectTypeValidation.update),
    asyncHandler(async (req, res) => {
        const item = await defectTypeService.getById(req.params.id);
        if (!item) return error.notFound(res, 'Defect type not found');
        const updated = await defectTypeService.update(req.params.id, req.body);
        return success.updated(res, 'Defect type updated', updated);
    })
];

const remove = asyncHandler(async (req, res) => {
    const item = await defectTypeService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Defect type not found');
    await defectTypeService.deactivate(req.params.id);
    return success.deleted(res, 'Defect type deactivated');
});

module.exports = { getAll, getById, create, update, remove };
