const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class ProductMasterService {
    // ─── Suppliers ────────────────────────────────────────────────────────────

    async getAllSuppliers(options = {}) {
        const { page = 1, limit = 10, search, is_active } = options;
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { contact_name: { contains: search, mode: 'insensitive' } },
                { contact_email: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.suppliers.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { name: 'asc' }
            }),
            prisma.suppliers.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getSupplierById(id) {
        return prisma.suppliers.findFirst({
            where: { id, deleted_at: null },
            include: {
                _count: { select: { products: true } }
            }
        });
    }

    async createSupplier(data) {
        return prisma.suppliers.create({ data });
    }

    async updateSupplier(id, data) {
        return prisma.suppliers.update({ where: { id }, data });
    }

    async softDeleteSupplier(id) {
        return prisma.suppliers.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
    }

    // ─── Product Types ────────────────────────────────────────────────────────

    async getAllProductTypes(options = {}) {
        const { page = 1, limit = 10, search, is_active } = options;
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.product_types.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' }
            }),
            prisma.product_types.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getProductTypeById(id) {
        return prisma.product_types.findFirst({
            where: { id, deleted_at: null },
            include: { _count: { select: { products: true } } }
        });
    }

    async createProductType(data) {
        return prisma.product_types.create({ data });
    }

    async updateProductType(id, data) {
        return prisma.product_types.update({ where: { id }, data });
    }

    async softDeleteProductType(id) {
        return prisma.product_types.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
    }

    // ─── Product Categories ───────────────────────────────────────────────────

    async getAllProductCategories(options = {}) {
        const { page = 1, limit = 10, search, is_active } = options;
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.product_categories.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' }
            }),
            prisma.product_categories.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getProductCategoryById(id) {
        return prisma.product_categories.findFirst({
            where: { id, deleted_at: null },
            include: { _count: { select: { mappings: true } } }
        });
    }

    async createProductCategory(data) {
        return prisma.product_categories.create({ data });
    }

    async updateProductCategory(id, data) {
        return prisma.product_categories.update({ where: { id }, data });
    }

    async softDeleteProductCategory(id) {
        return prisma.product_categories.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
    }
}

module.exports = new ProductMasterService();
