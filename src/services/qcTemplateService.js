const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class QcTemplateService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            qc_phase, is_active,
            sortBy = 'display_order', sortOrder = 'asc'
        } = options;

        const skip = (page - 1) * limit;
        const where = {};
        if (qc_phase) where.qc_phase = qc_phase;
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.qc_templates.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.qc_templates.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.qc_templates.findUnique({
            where: { id },
            include: {
                checklist_items: { orderBy: { display_order: 'asc' } }
            }
        });
    }

    async create(data) {
        return prisma.qc_templates.create({ data });
    }

    async update(id, data) {
        return prisma.qc_templates.update({ where: { id }, data });
    }

    async deactivate(id) {
        return prisma.qc_templates.update({
            where: { id },
            data: { is_active: false }
        });
    }

    // Checklist items
    async getChecklistItems(templateId) {
        return prisma.qc_checklist_items.findMany({
            where: { qc_template_id: templateId },
            orderBy: { display_order: 'asc' }
        });
    }

    async addChecklistItem(templateId, data) {
        return prisma.qc_checklist_items.create({
            data: { ...data, qc_template_id: templateId }
        });
    }

    async updateChecklistItem(itemId, data) {
        return prisma.qc_checklist_items.update({ where: { id: itemId }, data });
    }

    async deleteChecklistItem(itemId) {
        return prisma.qc_checklist_items.delete({ where: { id: itemId } });
    }
}

module.exports = new QcTemplateService();
