const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');
const XLSX = require('xlsx');

// ─── Default include untuk GET product ────────────────────────────────────────
const DEFAULT_INCLUDE = {
    type: { select: { id: true, code: true, name: true } },
    supplier: { select: { id: true, code: true, name: true } },
    categories: {
        include: { category: { select: { id: true, code: true, name: true } } }
    },
    qc_templates: {
        where: { is_active: true },
        orderBy: { display_order: 'asc' },
        include: { level_inspection: true }
    }
};

class ProductService {
    // ─── Query ────────────────────────────────────────────────────────────────

    async getAll(options = {}) {
        const { page = 1, limit = 10, search, product_type_id, supplier_id,
            is_active, is_serialize, is_qc } = options;
        const skip = (page - 1) * limit;

        const where = { deleted_at: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sap_code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (product_type_id) where.product_type_id = product_type_id;
        if (supplier_id) where.supplier_id = supplier_id;
        if (is_active !== undefined) where.is_active = is_active;
        if (is_serialize !== undefined) where.is_serialize = is_serialize;
        if (is_qc !== undefined) where.is_qc = is_qc;

        const [data, total] = await Promise.all([
            prisma.products.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: DEFAULT_INCLUDE
            }),
            prisma.products.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.products.findFirst({
            where: { id, deleted_at: null },
            include: {
                ...DEFAULT_INCLUDE,
                // Also include all qc_templates (active + inactive) for detail view
                qc_templates: {
                    orderBy: { display_order: 'asc' },
                    include: { level_inspection: true }
                },
                parent_components: {
                    include: {
                        component: { select: { id: true, sap_code: true, name: true } }
                    }
                }
            }
        });
    }

    async getBySapCode(sapCode) {
        return prisma.products.findFirst({
            where: { sap_code: sapCode, deleted_at: null }
        });
    }

    // ─── Create (dengan inline categories) ──────────────────────────────────

    async create(data) {
        const { category_ids = [], ...productData } = data;

        return prisma.$transaction(async (tx) => {
            // 1. Buat product
            const product = await tx.products.create({ data: productData });

            // 2. Buat category mappings jika ada
            if (category_ids.length > 0) {
                await tx.product_category_mappings.createMany({
                    data: category_ids.map(category_id => ({
                        product_id: product.id,
                        category_id
                    })),
                    skipDuplicates: true
                });
            }

            // 3. Return dengan relasi lengkap
            return tx.products.findUnique({
                where: { id: product.id },
                include: DEFAULT_INCLUDE
            });
        });
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    async update(id, data) {
        const { category_ids, ...productData } = data;

        return prisma.$transaction(async (tx) => {
            // 1. Update field product
            if (Object.keys(productData).length > 0) {
                await tx.products.update({ where: { id }, data: productData });
            }

            // 2. Ganti semua category mappings jika category_ids diberikan
            if (category_ids !== undefined) {
                await tx.product_category_mappings.deleteMany({ where: { product_id: id } });
                if (category_ids.length > 0) {
                    await tx.product_category_mappings.createMany({
                        data: category_ids.map(category_id => ({
                            product_id: id,
                            category_id
                        })),
                        skipDuplicates: true
                    });
                }
            }

            return tx.products.findUnique({
                where: { id },
                include: DEFAULT_INCLUDE
            });
        });
    }

    async softDelete(id) {
        return prisma.products.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
    }

    // ─── QC Template Assignments (via /products/:id/level-inspections routes) ──

    async getLevelInspections(productId) {
        return prisma.qc_templates.findMany({
            where: { product_id: productId },
            orderBy: { display_order: 'asc' },
            include: { level_inspection: true }
        });
    }

    // Assign an existing QC template to this product
    async addLevelInspection(productId, data) {
        const { qc_template_id } = data;

        const template = await prisma.qc_templates.findUnique({ where: { id: qc_template_id } });
        if (!template) throw Object.assign(new Error('QC template not found'), { statusCode: 404 });
        if (template.product_id && template.product_id !== productId) {
            throw Object.assign(new Error('Template already assigned to another product'), { statusCode: 409 });
        }

        return prisma.qc_templates.update({
            where: { id: qc_template_id },
            data: { product_id: productId },
            include: { level_inspection: true }
        });
    }

    // Unassign: set product_id = null (template kembali ke pool)
    async deleteLevelInspection(templateId) {
        return prisma.qc_templates.update({
            where: { id: templateId },
            data: { product_id: null }
        });
    }

    async getLevelInspectionById(id) {
        return prisma.qc_templates.findUnique({
            where: { id },
            include: { level_inspection: true }
        });
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    async generateXlsx(options = {}) {
        const where = { deleted_at: null };
        if (options.is_active !== undefined) where.is_active = options.is_active === 'true' || options.is_active === true;

        const products = await prisma.products.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                type: { select: { code: true, name: true } },
                supplier: { select: { code: true, name: true } },
                categories: { include: { category: { select: { code: true, name: true } } } }
            }
        });

        const rows = products.map((p) => ({
            sap_code: p.sap_code,
            name: p.name,
            description: p.description || '',
            product_type_code: p.type?.code || '',
            supplier_code: p.supplier?.code || '',
            categories: p.categories.map((c) => c.category.code).join('|'),
            is_serialize: p.is_serialize ? 'TRUE' : 'FALSE',
            is_qc: p.is_qc ? 'TRUE' : 'FALSE',
            is_active: p.is_active ? 'TRUE' : 'FALSE',
            created_at: p.created_at ? new Date(p.created_at).toISOString() : ''
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 20 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 },
            { wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 24 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    generateTemplate() {
        const headers = [{
            sap_code: 'SAP-001',
            name: 'Contoh Produk',
            description: 'Deskripsi opsional',
            product_type_code: 'TYPE-001',
            supplier_code: 'SUP-001',
            categories: 'CAT-001|CAT-002',
            is_serialize: 'TRUE',
            is_qc: 'TRUE',
            is_active: 'TRUE'
        }];
        const ws = XLSX.utils.json_to_sheet(headers);
        ws['!cols'] = [
            { wch: 20 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 },
            { wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 10 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    // ─── Import ───────────────────────────────────────────────────────────────

    async importFromXlsx(buffer) {
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rows.length === 0) throw { status: 400, message: 'File kosong atau tidak ada data di sheet pertama' };

        // Load lookup tables
        const [types, suppliers, categories] = await Promise.all([
            prisma.product_types.findMany({ where: { deleted_at: null }, select: { id: true, code: true } }),
            prisma.suppliers.findMany({ where: { deleted_at: null }, select: { id: true, code: true } }),
            prisma.product_categories.findMany({ where: { deleted_at: null }, select: { id: true, code: true } })
        ]);

        const typeMap = Object.fromEntries(types.map((t) => [t.code.trim().toUpperCase(), t.id]));
        const supplierMap = Object.fromEntries(suppliers.map((s) => [s.code.trim().toUpperCase(), s.id]));
        const categoryMap = Object.fromEntries(categories.map((c) => [c.code.trim().toUpperCase(), c.id]));

        const results = { created: 0, updated: 0, skipped: 0, errors: [] };

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // Excel row number (1=header)

            try {
                const sapCode = String(row.sap_code || '').trim();
                const name = String(row.name || '').trim();

                if (!sapCode) { results.errors.push({ row: rowNum, error: 'sap_code kosong' }); results.skipped++; continue; }
                if (!name) { results.errors.push({ row: rowNum, sap_code: sapCode, error: 'name kosong' }); results.skipped++; continue; }

                const typeCode = String(row.product_type_code || '').trim().toUpperCase();
                const supplierCode = String(row.supplier_code || '').trim().toUpperCase();

                const product_type_id = typeMap[typeCode];
                const supplier_id = supplierMap[supplierCode];

                if (!product_type_id) { results.errors.push({ row: rowNum, sap_code: sapCode, error: `product_type_code "${row.product_type_code}" tidak ditemukan` }); results.skipped++; continue; }
                if (!supplier_id) { results.errors.push({ row: rowNum, sap_code: sapCode, error: `supplier_code "${row.supplier_code}" tidak ditemukan` }); results.skipped++; continue; }

                const parseBool = (val, def = true) => {
                    const s = String(val).trim().toUpperCase();
                    if (s === 'TRUE' || s === '1' || s === 'YES') return true;
                    if (s === 'FALSE' || s === '0' || s === 'NO') return false;
                    return def;
                };

                // Parse category codes (pipe-separated)
                const categoryCodes = String(row.categories || '').split('|').map((c) => c.trim().toUpperCase()).filter(Boolean);
                const category_ids = categoryCodes.map((c) => categoryMap[c]).filter(Boolean);

                const productData = {
                    name,
                    description: String(row.description || '').trim() || null,
                    product_type_id,
                    supplier_id,
                    is_serialize: parseBool(row.is_serialize),
                    is_qc: parseBool(row.is_qc),
                    is_active: parseBool(row.is_active),
                    deleted_at: null
                };

                const existing = await prisma.products.findFirst({ where: { sap_code: sapCode } });

                await prisma.$transaction(async (tx) => {
                    let product;
                    if (existing) {
                        product = await tx.products.update({ where: { id: existing.id }, data: productData });
                        results.updated++;
                    } else {
                        product = await tx.products.create({ data: { sap_code: sapCode, ...productData } });
                        results.created++;
                    }
                    // Sync categories
                    if (categoryCodes.length > 0) {
                        await tx.product_category_mappings.deleteMany({ where: { product_id: product.id } });
                        if (category_ids.length > 0) {
                            await tx.product_category_mappings.createMany({
                                data: category_ids.map((category_id) => ({ product_id: product.id, category_id })),
                                skipDuplicates: true
                            });
                        }
                    }
                });
            } catch (err) {
                results.errors.push({ row: rowNum, sap_code: String(row.sap_code || ''), error: err.message });
                results.skipped++;
            }
        }

        return results;
    }
}

module.exports = new ProductService();
