const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

// ─── Default include untuk GET product ────────────────────────────────────────
const DEFAULT_INCLUDE = {
    type: { select: { id: true, code: true, name: true } },
    supplier: { select: { id: true, code: true, name: true } },
    categories: {
        include: { category: { select: { id: true, code: true, name: true } } }
    },
    level_inspections: {
        where: { is_active: true },
        orderBy: { valid_from: 'desc' },
        include: {
            qc_template: { select: { id: true, code: true, name: true } }
        }
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
                // Also include all level_inspections (active + inactive) for detail view
                level_inspections: {
                    orderBy: { valid_from: 'desc' },
                    include: {
                        qc_template: { select: { id: true, code: true, name: true } }
                    }
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

    // ─── Create (dengan inline categories + level_inspections) ────────────────

    async create(data) {
        const { category_ids = [], level_inspections = [], ...productData } = data;

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

            // 3. Buat level inspections jika ada
            if (level_inspections.length > 0) {
                await tx.level_inspections.createMany({
                    data: level_inspections.map(li => ({
                        ...li,
                        product_id: product.id
                    }))
                });
            }

            // 4. Return dengan relasi lengkap
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

    // ─── Level Inspections (nested endpoints) ─────────────────────────────────

    async getLevelInspections(productId) {
        return prisma.level_inspections.findMany({
            where: { product_id: productId },
            orderBy: { valid_from: 'desc' },
            include: {
                qc_template: { select: { id: true, code: true, name: true } }
            }
        });
    }

    async addLevelInspection(productId, data) {
        return prisma.level_inspections.create({
            data: { ...data, product_id: productId },
            include: {
                qc_template: { select: { id: true, code: true, name: true } }
            }
        });
    }

    async updateLevelInspection(levelInspectionId, data) {
        return prisma.level_inspections.update({
            where: { id: levelInspectionId },
            data,
            include: {
                qc_template: { select: { id: true, code: true, name: true } }
            }
        });
    }

    async deleteLevelInspection(levelInspectionId) {
        return prisma.level_inspections.delete({ where: { id: levelInspectionId } });
    }

    async getLevelInspectionById(id) {
        return prisma.level_inspections.findUnique({ where: { id } });
    }
}

module.exports = new ProductService();
