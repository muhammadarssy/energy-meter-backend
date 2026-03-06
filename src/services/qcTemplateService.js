const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class QcTemplateService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            qc_phase, is_active, product_id, unassigned,
            sortBy = 'display_order', sortOrder = 'asc'
        } = options;

        const skip = (page - 1) * limit;
        const where = {};
        if (qc_phase) where.qc_phase = qc_phase;
        if (is_active !== undefined) where.is_active = is_active;
        if (product_id) where.product_id = product_id;
        if (unassigned) where.product_id = null; // hanya template yang belum di-assign ke produk

        const [data, total] = await Promise.all([
            prisma.qc_templates.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: { level_inspection: true }
            }),
            prisma.qc_templates.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.qc_templates.findUnique({
            where: { id },
            include: {
                checklist_items: { orderBy: { display_order: 'asc' } },
                level_inspection: {
                    include: { defect_types: { include: { defect_type: true } } }
                }
            }
        });
    }

    async create(data) {
        const {
            level, aql_critical, aql_major, aql_minor, sample_size,
            accept_critical, accept_major, accept_minor,
            reject_critical, reject_major, reject_minor,
            notes: li_notes,
            ...templateData
        } = data;

        const hasLi = aql_critical !== undefined || aql_major !== undefined ||
                      aql_minor !== undefined || level !== undefined;

        if (!hasLi) {
            return prisma.qc_templates.create({
                data: templateData,
                include: { level_inspection: true }
            });
        }

        return prisma.$transaction(async (tx) => {
            const template = await tx.qc_templates.create({ data: templateData });
            await tx.level_inspections.create({
                data: {
                    qc_template_id: template.id,
                    level: level || 'II',
                    aql_critical: aql_critical ?? 0,
                    aql_major: aql_major ?? 0,
                    aql_minor: aql_minor ?? 0,
                    sample_size, accept_critical, accept_major, accept_minor,
                    reject_critical, reject_major, reject_minor,
                    notes: li_notes
                }
            });
            return tx.qc_templates.findUnique({
                where: { id: template.id },
                include: { level_inspection: true }
            });
        });
    }

    async update(id, data) {
        const {
            level, aql_critical, aql_major, aql_minor, sample_size,
            accept_critical, accept_major, accept_minor,
            reject_critical, reject_major, reject_minor,
            notes: li_notes,
            ...templateData
        } = data;

        const liFields = Object.fromEntries(
            Object.entries({ level, aql_critical, aql_major, aql_minor, sample_size,
                accept_critical, accept_major, accept_minor,
                reject_critical, reject_major, reject_minor, notes: li_notes
            }).filter(([, v]) => v !== undefined)
        );

        return prisma.$transaction(async (tx) => {
            if (Object.keys(templateData).length > 0) {
                await tx.qc_templates.update({ where: { id }, data: templateData });
            }
            if (Object.keys(liFields).length > 0) {
                await tx.level_inspections.upsert({
                    where: { qc_template_id: id },
                    update: liFields,
                    create: {
                        qc_template_id: id,
                        level: liFields.level || 'II',
                        aql_critical: liFields.aql_critical ?? 0,
                        aql_major: liFields.aql_major ?? 0,
                        aql_minor: liFields.aql_minor ?? 0,
                        ...liFields
                    }
                });
            }
            return tx.qc_templates.findUnique({
                where: { id },
                include: { level_inspection: true }
            });
        });
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

    // ─── Level Inspection (1:1 per template) ─────────────────────────────────

    async getLevelInspection(templateId) {
        return prisma.level_inspections.findUnique({
            where: { qc_template_id: templateId },
            include: { defect_types: { include: { defect_type: true } } }
        });
    }

    async saveLevelInspection(templateId, data) {
        const { level = 'II', aql_critical = 0, aql_major = 0, aql_minor = 0, ...rest } = data;
        return prisma.level_inspections.upsert({
            where: { qc_template_id: templateId },
            update: data,
            create: { qc_template_id: templateId, level, aql_critical, aql_major, aql_minor, ...rest }
        });
    }

    async deleteLevelInspection(templateId) {
        return prisma.level_inspections.delete({ where: { qc_template_id: templateId } });
    }
}

module.exports = new QcTemplateService();
