const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class PlnMasterService {
    // ─── Material Groups ──────────────────────────────────────────────────────

    async getAllMaterialGroups(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            prisma.material_groups.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' },
                include: { sub_groups: { select: { id: true, code: true, name: true } } }
            }),
            prisma.material_groups.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getMaterialGroupById(id) {
        return prisma.material_groups.findUnique({
            where: { id },
            include: { sub_groups: true }
        });
    }

    async createMaterialGroup(data) {
        return prisma.material_groups.create({ data });
    }

    async updateMaterialGroup(id, data) {
        return prisma.material_groups.update({ where: { id }, data });
    }

    async deleteMaterialGroup(id) {
        return prisma.material_groups.delete({ where: { id } });
    }

    // ─── Material Sub Groups ──────────────────────────────────────────────────

    async getAllMaterialSubGroups(options = {}) {
        const { page = 1, limit = 10, material_group_id, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (material_group_id) where.material_group_id = material_group_id;
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            prisma.material_sub_groups.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' },
                include: { material_group: { select: { id: true, code: true, name: true } } }
            }),
            prisma.material_sub_groups.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getMaterialSubGroupById(id) {
        return prisma.material_sub_groups.findUnique({
            where: { id },
            include: { material_group: true }
        });
    }

    async createMaterialSubGroup(data) {
        return prisma.material_sub_groups.create({
            data,
            include: { material_group: { select: { id: true, code: true, name: true } } }
        });
    }

    async updateMaterialSubGroup(id, data) {
        return prisma.material_sub_groups.update({ where: { id }, data });
    }

    async deleteMaterialSubGroup(id) {
        return prisma.material_sub_groups.delete({ where: { id } });
    }

    // ─── Variants ─────────────────────────────────────────────────────────────

    async getAllVariants(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            prisma.variants.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' }
            }),
            prisma.variants.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getVariantById(id) {
        return prisma.variants.findUnique({ where: { id } });
    }

    async createVariant(data) {
        return prisma.variants.create({ data });
    }

    async updateVariant(id, data) {
        return prisma.variants.update({ where: { id }, data });
    }

    async deleteVariant(id) {
        return prisma.variants.delete({ where: { id } });
    }

    // ─── Factories ────────────────────────────────────────────────────────────

    async getAllFactories(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            prisma.factories.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { code: 'asc' },
                include: { meter_code_counter: true }
            }),
            prisma.factories.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getFactoryById(id) {
        return prisma.factories.findUnique({
            where: { id },
            include: { meter_code_counter: true }
        });
    }

    async createFactory(data) {
        return prisma.factories.create({ data });
    }

    async updateFactory(id, data) {
        return prisma.factories.update({ where: { id }, data });
    }

    async deleteFactory(id) {
        return prisma.factories.delete({ where: { id } });
    }
}

module.exports = new PlnMasterService();
