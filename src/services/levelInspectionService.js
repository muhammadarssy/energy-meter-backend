const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class LevelInspectionService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            qc_template_id, is_active,
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = {};
        if (qc_template_id) where.qc_template_id = qc_template_id;
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.level_inspections.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    defect_types: { include: { defect_type: true } },
                    qc_template: { select: { id: true, code: true, name: true } }
                }
            }),
            prisma.level_inspections.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.level_inspections.findUnique({
            where: { id },
            include: {
                defect_types: { include: { defect_type: true } },
                qc_template: true
            }
        });
    }

    async getActiveByProduct(productId) {
        return prisma.level_inspections.findFirst({
            where: { is_active: true, qc_template: { product_id: productId } },
            orderBy: { valid_from: 'desc' },
            include: {
                defect_types: { include: { defect_type: true } },
                qc_template: {
                    include: { checklist_items: { orderBy: { display_order: 'asc' } } }
                }
            }
        });
    }

    async create(data) {
        return prisma.level_inspections.create({ data });
    }

    async update(id, data) {
        return prisma.level_inspections.update({ where: { id }, data });
    }

    async deactivate(id) {
        return prisma.level_inspections.update({
            where: { id },
            data: { is_active: false, valid_to: new Date() }
        });
    }

    // Defect type links
    async addDefectType(levelInspectionId, defectTypeId) {
        return prisma.level_inspection_defects.create({
            data: { level_inspection_id: levelInspectionId, defect_type_id: defectTypeId }
        });
    }

    async removeDefectType(levelInspectionId, defectTypeId) {
        return prisma.level_inspection_defects.delete({
            where: {
                level_inspection_id_defect_type_id: {
                    level_inspection_id: levelInspectionId,
                    defect_type_id: defectTypeId
                }
            }
        });
    }
}

module.exports = new LevelInspectionService();
