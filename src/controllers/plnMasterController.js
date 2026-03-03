const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { plnCodeValidation } = require('../validations/plnCodeValidation');
const plnMasterService = require('../services/plnMasterService');

const querySchema = require('joi').object({
    page: require('joi').number().integer().min(1).default(1),
    limit: require('joi').number().integer().min(1).max(100).default(10),
    search: require('joi').string().max(255).allow('').optional(),
    material_group_id: require('joi').string().uuid().optional()
});

// ─── Material Groups ──────────────────────────────────────────────────────────

const getAllMaterialGroups = [
    validate(querySchema, 'query'),
    asyncHandler(async (req, res) => {
        const result = await plnMasterService.getAllMaterialGroups(req.query);
        return success.ok(res, 'Material groups retrieved', result.data, result.meta);
    })
];

const getMaterialGroupById = asyncHandler(async (req, res) => {
    const item = await plnMasterService.getMaterialGroupById(req.params.id);
    if (!item) return error.notFound(res, 'Material group not found');
    return success.ok(res, 'Material group retrieved', item);
});

const createMaterialGroup = [
    validate(plnCodeValidation.materialGroup.create),
    asyncHandler(async (req, res) => {
        const item = await plnMasterService.createMaterialGroup(req.body);
        return success.created(res, 'Material group created', item);
    })
];

const updateMaterialGroup = [
    validate(plnCodeValidation.materialGroup.update),
    asyncHandler(async (req, res) => {
        const existing = await plnMasterService.getMaterialGroupById(req.params.id);
        if (!existing) return error.notFound(res, 'Material group not found');
        const updated = await plnMasterService.updateMaterialGroup(req.params.id, req.body);
        return success.updated(res, 'Material group updated', updated);
    })
];

const deleteMaterialGroup = asyncHandler(async (req, res) => {
    const existing = await plnMasterService.getMaterialGroupById(req.params.id);
    if (!existing) return error.notFound(res, 'Material group not found');
    await plnMasterService.deleteMaterialGroup(req.params.id);
    return success.deleted(res, 'Material group deleted');
});

// ─── Material Sub Groups ──────────────────────────────────────────────────────

const getAllMaterialSubGroups = [
    validate(querySchema, 'query'),
    asyncHandler(async (req, res) => {
        const result = await plnMasterService.getAllMaterialSubGroups(req.query);
        return success.ok(res, 'Material sub groups retrieved', result.data, result.meta);
    })
];

const getMaterialSubGroupById = asyncHandler(async (req, res) => {
    const item = await plnMasterService.getMaterialSubGroupById(req.params.id);
    if (!item) return error.notFound(res, 'Material sub group not found');
    return success.ok(res, 'Material sub group retrieved', item);
});

const createMaterialSubGroup = [
    validate(plnCodeValidation.materialSubGroup.create),
    asyncHandler(async (req, res) => {
        const item = await plnMasterService.createMaterialSubGroup(req.body);
        return success.created(res, 'Material sub group created', item);
    })
];

const updateMaterialSubGroup = [
    validate(plnCodeValidation.materialSubGroup.update),
    asyncHandler(async (req, res) => {
        const existing = await plnMasterService.getMaterialSubGroupById(req.params.id);
        if (!existing) return error.notFound(res, 'Material sub group not found');
        const updated = await plnMasterService.updateMaterialSubGroup(req.params.id, req.body);
        return success.updated(res, 'Material sub group updated', updated);
    })
];

const deleteMaterialSubGroup = asyncHandler(async (req, res) => {
    const existing = await plnMasterService.getMaterialSubGroupById(req.params.id);
    if (!existing) return error.notFound(res, 'Material sub group not found');
    await plnMasterService.deleteMaterialSubGroup(req.params.id);
    return success.deleted(res, 'Material sub group deleted');
});

// ─── Variants ─────────────────────────────────────────────────────────────────

const getAllVariants = [
    validate(querySchema, 'query'),
    asyncHandler(async (req, res) => {
        const result = await plnMasterService.getAllVariants(req.query);
        return success.ok(res, 'Variants retrieved', result.data, result.meta);
    })
];

const getVariantById = asyncHandler(async (req, res) => {
    const item = await plnMasterService.getVariantById(req.params.id);
    if (!item) return error.notFound(res, 'Variant not found');
    return success.ok(res, 'Variant retrieved', item);
});

const createVariant = [
    validate(plnCodeValidation.variant.create),
    asyncHandler(async (req, res) => {
        const item = await plnMasterService.createVariant(req.body);
        return success.created(res, 'Variant created', item);
    })
];

const updateVariant = [
    validate(plnCodeValidation.variant.update),
    asyncHandler(async (req, res) => {
        const existing = await plnMasterService.getVariantById(req.params.id);
        if (!existing) return error.notFound(res, 'Variant not found');
        const updated = await plnMasterService.updateVariant(req.params.id, req.body);
        return success.updated(res, 'Variant updated', updated);
    })
];

const deleteVariant = asyncHandler(async (req, res) => {
    const existing = await plnMasterService.getVariantById(req.params.id);
    if (!existing) return error.notFound(res, 'Variant not found');
    await plnMasterService.deleteVariant(req.params.id);
    return success.deleted(res, 'Variant deleted');
});

// ─── Factories ────────────────────────────────────────────────────────────────

const getAllFactories = [
    validate(querySchema, 'query'),
    asyncHandler(async (req, res) => {
        const result = await plnMasterService.getAllFactories(req.query);
        return success.ok(res, 'Factories retrieved', result.data, result.meta);
    })
];

const getFactoryById = asyncHandler(async (req, res) => {
    const item = await plnMasterService.getFactoryById(req.params.id);
    if (!item) return error.notFound(res, 'Factory not found');
    return success.ok(res, 'Factory retrieved', item);
});

const createFactory = [
    validate(plnCodeValidation.factory.create),
    asyncHandler(async (req, res) => {
        const item = await plnMasterService.createFactory(req.body);
        return success.created(res, 'Factory created', item);
    })
];

const updateFactory = [
    validate(plnCodeValidation.factory.update),
    asyncHandler(async (req, res) => {
        const existing = await plnMasterService.getFactoryById(req.params.id);
        if (!existing) return error.notFound(res, 'Factory not found');
        const updated = await plnMasterService.updateFactory(req.params.id, req.body);
        return success.updated(res, 'Factory updated', updated);
    })
];

const deleteFactory = asyncHandler(async (req, res) => {
    const existing = await plnMasterService.getFactoryById(req.params.id);
    if (!existing) return error.notFound(res, 'Factory not found');
    await plnMasterService.deleteFactory(req.params.id);
    return success.deleted(res, 'Factory deleted');
});

module.exports = {
    getAllMaterialGroups, getMaterialGroupById, createMaterialGroup, updateMaterialGroup, deleteMaterialGroup,
    getAllMaterialSubGroups, getMaterialSubGroupById, createMaterialSubGroup, updateMaterialSubGroup, deleteMaterialSubGroup,
    getAllVariants, getVariantById, createVariant, updateVariant, deleteVariant,
    getAllFactories, getFactoryById, createFactory, updateFactory, deleteFactory
};
