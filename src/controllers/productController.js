const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { productValidation } = require('../validations/productValidation');
const productService = require('../services/productService');

// ─── Products ─────────────────────────────────────────────────────────────────

const getAll = [
    validate(productValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await productService.getAll(req.query);
        return success.ok(res, 'Products retrieved', result.data, result.meta);
    })
];

const getById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);
    if (!product) return error.notFound(res, 'Product not found');
    return success.ok(res, 'Product retrieved', product);
});

/**
 * POST /api/products
 * Body: { sap_code, name, description, product_type_id, supplier_id,
 *         is_serialize, is_qc, is_active, qc_product, image_url,
 *         category_ids: [...uuid],
 *         level_inspections: [{ level, aql_critical, aql_major, aql_minor, ... }] }
 */
const create = [
    validate(productValidation.create),
    asyncHandler(async (req, res) => {
        const product = await productService.create(req.body);
        return success.created(res, 'Product created', product);
    })
];

/**
 * PATCH /api/products/:id
 * Body: product fields + optional category_ids (replaces all)
 */
const update = [
    validate(productValidation.update),
    asyncHandler(async (req, res) => {
        const existing = await productService.getById(req.params.id);
        if (!existing) return error.notFound(res, 'Product not found');
        const updated = await productService.update(req.params.id, req.body);
        return success.updated(res, 'Product updated', updated);
    })
];

const softDelete = asyncHandler(async (req, res) => {
    const existing = await productService.getById(req.params.id);
    if (!existing) return error.notFound(res, 'Product not found');
    await productService.softDelete(req.params.id);
    return success.deleted(res, 'Product deleted');
});

// ─── Level Inspections (nested di bawah product) ──────────────────────────────

const getLevelInspections = asyncHandler(async (req, res) => {
    const existing = await productService.getById(req.params.id);
    if (!existing) return error.notFound(res, 'Product not found');
    const items = await productService.getLevelInspections(req.params.id);
    return success.ok(res, 'Level inspections retrieved', items);
});

const addLevelInspection = [
    validate(productValidation.addLevelInspection),
    asyncHandler(async (req, res) => {
        const existing = await productService.getById(req.params.id);
        if (!existing) return error.notFound(res, 'Product not found');
        const item = await productService.addLevelInspection(req.params.id, req.body);
        return success.created(res, 'Level inspection added', item);
    })
];

const updateLevelInspection = [
    validate(productValidation.updateLevelInspection),
    asyncHandler(async (req, res) => {
        const li = await productService.getLevelInspectionById(req.params.liId);
        if (!li || li.product_id !== req.params.id) {
            return error.notFound(res, 'Level inspection not found');
        }
        const updated = await productService.updateLevelInspection(req.params.liId, req.body);
        return success.updated(res, 'Level inspection updated', updated);
    })
];

const deleteLevelInspection = asyncHandler(async (req, res) => {
    const li = await productService.getLevelInspectionById(req.params.liId);
    if (!li || li.product_id !== req.params.id) {
        return error.notFound(res, 'Level inspection not found');
    }
    await productService.deleteLevelInspection(req.params.liId);
    return success.deleted(res, 'Level inspection deleted');
});

module.exports = {
    getAll, getById, create, update, softDelete,
    getLevelInspections, addLevelInspection, updateLevelInspection, deleteLevelInspection
};
