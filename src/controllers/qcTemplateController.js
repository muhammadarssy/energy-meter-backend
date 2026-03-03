const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { qcTemplateValidation } = require('../validations/qcTemplateValidation');
const qcTemplateService = require('../services/qcTemplateService');

// Templates
const getAll = [
    validate(qcTemplateValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await qcTemplateService.getAll(req.query);
        return success.ok(res, 'QC templates retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const item = await qcTemplateService.getById(req.params.id);
    if (!item) return error.notFound(res, 'QC template not found');
    return success.ok(res, 'QC template retrieved', item);
});

const create = [
    validate(qcTemplateValidation.create),
    asyncHandler(async (req, res) => {
        const item = await qcTemplateService.create(req.body);
        return success.created(res, 'QC template created', item);
    })
];

const update = [
    validate(qcTemplateValidation.update),
    asyncHandler(async (req, res) => {
        const item = await qcTemplateService.getById(req.params.id);
        if (!item) return error.notFound(res, 'QC template not found');
        const updated = await qcTemplateService.update(req.params.id, req.body);
        return success.updated(res, 'QC template updated', updated);
    })
];

const remove = asyncHandler(async (req, res) => {
    const item = await qcTemplateService.getById(req.params.id);
    if (!item) return error.notFound(res, 'QC template not found');
    await qcTemplateService.deactivate(req.params.id);
    return success.deleted(res, 'QC template deactivated');
});

// Checklist items
const getChecklistItems = asyncHandler(async (req, res) => {
    const items = await qcTemplateService.getChecklistItems(req.params.id);
    return success.ok(res, 'Checklist items retrieved', items);
});

const addChecklistItem = [
    validate(qcTemplateValidation.checklistItem.create),
    asyncHandler(async (req, res) => {
        const template = await qcTemplateService.getById(req.params.id);
        if (!template) return error.notFound(res, 'QC template not found');
        const item = await qcTemplateService.addChecklistItem(req.params.id, req.body);
        return success.created(res, 'Checklist item added', item);
    })
];

const updateChecklistItem = [
    validate(qcTemplateValidation.checklistItem.update),
    asyncHandler(async (req, res) => {
        const item = await qcTemplateService.updateChecklistItem(req.params.itemId, req.body);
        return success.updated(res, 'Checklist item updated', item);
    })
];

const removeChecklistItem = asyncHandler(async (req, res) => {
    await qcTemplateService.deleteChecklistItem(req.params.itemId);
    return success.deleted(res, 'Checklist item deleted');
});

module.exports = {
    getAll, getById, create, update, remove,
    getChecklistItems, addChecklistItem, updateChecklistItem, removeChecklistItem
};
