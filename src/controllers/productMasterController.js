const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { productMasterValidation } = require('../validations/productMasterValidation');
const productMasterService = require('../services/productMasterService');

// ─── Suppliers ────────────────────────────────────────────────────────────────

const getAllSuppliers = [
    validate(productMasterValidation.supplier.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await productMasterService.getAllSuppliers(req.query);
        return success.ok(res, 'Suppliers retrieved', result.data, result.meta);
    })
];

const getSupplierById = asyncHandler(async (req, res) => {
    const item = await productMasterService.getSupplierById(req.params.id);
    if (!item) return error.notFound(res, 'Supplier not found');
    return success.ok(res, 'Supplier retrieved', item);
});

const createSupplier = [
    validate(productMasterValidation.supplier.create),
    asyncHandler(async (req, res) => {
        const item = await productMasterService.createSupplier(req.body);
        return success.created(res, 'Supplier created', item);
    })
];

const updateSupplier = [
    validate(productMasterValidation.supplier.update),
    asyncHandler(async (req, res) => {
        const existing = await productMasterService.getSupplierById(req.params.id);
        if (!existing) return error.notFound(res, 'Supplier not found');
        const updated = await productMasterService.updateSupplier(req.params.id, req.body);
        return success.updated(res, 'Supplier updated', updated);
    })
];

const deleteSupplier = asyncHandler(async (req, res) => {
    const existing = await productMasterService.getSupplierById(req.params.id);
    if (!existing) return error.notFound(res, 'Supplier not found');
    await productMasterService.softDeleteSupplier(req.params.id);
    return success.deleted(res, 'Supplier deleted');
});

// ─── Product Types ────────────────────────────────────────────────────────────

const getAllProductTypes = [
    validate(productMasterValidation.productType.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await productMasterService.getAllProductTypes(req.query);
        return success.ok(res, 'Product types retrieved', result.data, result.meta);
    })
];

const getProductTypeById = asyncHandler(async (req, res) => {
    const item = await productMasterService.getProductTypeById(req.params.id);
    if (!item) return error.notFound(res, 'Product type not found');
    return success.ok(res, 'Product type retrieved', item);
});

const createProductType = [
    validate(productMasterValidation.productType.create),
    asyncHandler(async (req, res) => {
        const item = await productMasterService.createProductType(req.body);
        return success.created(res, 'Product type created', item);
    })
];

const updateProductType = [
    validate(productMasterValidation.productType.update),
    asyncHandler(async (req, res) => {
        const existing = await productMasterService.getProductTypeById(req.params.id);
        if (!existing) return error.notFound(res, 'Product type not found');
        const updated = await productMasterService.updateProductType(req.params.id, req.body);
        return success.updated(res, 'Product type updated', updated);
    })
];

const deleteProductType = asyncHandler(async (req, res) => {
    const existing = await productMasterService.getProductTypeById(req.params.id);
    if (!existing) return error.notFound(res, 'Product type not found');
    await productMasterService.softDeleteProductType(req.params.id);
    return success.deleted(res, 'Product type deleted');
});

// ─── Product Categories ───────────────────────────────────────────────────────

const getAllProductCategories = [
    validate(productMasterValidation.productCategory.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await productMasterService.getAllProductCategories(req.query);
        return success.ok(res, 'Product categories retrieved', result.data, result.meta);
    })
];

const getProductCategoryById = asyncHandler(async (req, res) => {
    const item = await productMasterService.getProductCategoryById(req.params.id);
    if (!item) return error.notFound(res, 'Product category not found');
    return success.ok(res, 'Product category retrieved', item);
});

const createProductCategory = [
    validate(productMasterValidation.productCategory.create),
    asyncHandler(async (req, res) => {
        const item = await productMasterService.createProductCategory(req.body);
        return success.created(res, 'Product category created', item);
    })
];

const updateProductCategory = [
    validate(productMasterValidation.productCategory.update),
    asyncHandler(async (req, res) => {
        const existing = await productMasterService.getProductCategoryById(req.params.id);
        if (!existing) return error.notFound(res, 'Product category not found');
        const updated = await productMasterService.updateProductCategory(req.params.id, req.body);
        return success.updated(res, 'Product category updated', updated);
    })
];

const deleteProductCategory = asyncHandler(async (req, res) => {
    const existing = await productMasterService.getProductCategoryById(req.params.id);
    if (!existing) return error.notFound(res, 'Product category not found');
    await productMasterService.softDeleteProductCategory(req.params.id);
    return success.deleted(res, 'Product category deleted');
});

module.exports = {
    getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier,
    getAllProductTypes, getProductTypeById, createProductType, updateProductType, deleteProductType,
    getAllProductCategories, getProductCategoryById, createProductCategory, updateProductCategory, deleteProductCategory
};
