const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class DefectTypeService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            search = '',
            category,
            is_active,
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category) where.category = category;
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.defect_types.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.defect_types.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.defect_types.findUnique({
            where: { id },
            include: {
                level_inspections: {
                    include: { level_inspection: { select: { id: true, level: true, product_id: true } } }
                }
            }
        });
    }

    async create(data) {
        return prisma.defect_types.create({ data });
    }

    async update(id, data) {
        return prisma.defect_types.update({ where: { id }, data });
    }

    async deactivate(id) {
        return prisma.defect_types.update({
            where: { id },
            data: { is_active: false }
        });
    }
}

module.exports = new DefectTypeService();
