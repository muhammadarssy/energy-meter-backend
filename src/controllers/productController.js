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

// ─── QC Template Assignments (nested di bawah product) ───────────────────────

const getLevelInspections = asyncHandler(async (req, res) => {
    const existing = await productService.getById(req.params.id);
    if (!existing) return error.notFound(res, 'Product not found');
    const items = await productService.getLevelInspections(req.params.id);
    return success.ok(res, 'QC templates retrieved', items);
});

/**
 * POST /api/products/:id/level-inspections
 * Body: { qc_template_id } — assign existing template to this product
 */
const addLevelInspection = [
    validate(productValidation.addLevelInspection),
    asyncHandler(async (req, res) => {
        const existing = await productService.getById(req.params.id);
        if (!existing) return error.notFound(res, 'Product not found');
        const item = await productService.addLevelInspection(req.params.id, req.body);
        return success.created(res, 'QC template assigned', item);
    })
];

/**
 * DELETE /api/products/:id/level-inspections/:liId
 * Unassigns the template from this product (sets product_id = null)
 */
const deleteLevelInspection = asyncHandler(async (req, res) => {
    const li = await productService.getLevelInspectionById(req.params.liId);
    if (!li || li.product_id !== req.params.id) {
        return error.notFound(res, 'Template not assigned to this product');
    }
    await productService.deleteLevelInspection(req.params.liId);
    return success.deleted(res, 'QC template unassigned');
});

// ─── Import / Export ────────────────────────────────────────────────────────

const exportProducts = asyncHandler(async (req, res) => {
    const buffer = await productService.generateXlsx(req.query);
    const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
});

const downloadTemplate = asyncHandler(async (req, res) => {
    const buffer = productService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="products_template.xlsx"');
    res.send(buffer);
});

const importProducts = asyncHandler(async (req, res) => {
    if (!req.file) return error.badRequest(res, 'File xlsx wajib diunggah');
    try {
        const result = await productService.importFromXlsx(req.file.buffer);
        return success.ok(res, 'Import selesai', result);
    } catch (err) {
        if (err.status === 400) return error.badRequest(res, err.message);
        throw err;
    }
});

module.exports = {
    getAll, getById, create, update, softDelete,
    getLevelInspections, addLevelInspection, deleteLevelInspection,
    exportProducts, downloadTemplate, importProducts
};
