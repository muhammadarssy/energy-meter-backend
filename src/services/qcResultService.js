const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class QcResultService {
    // ─── Sample Inspections ────────────────────────────────────────────────────

    async createSnapshot(params) {
        const { product_id, qc_phase, receiving_item_id, assembly_id, shipping_id } = params;

        // Fetch active level inspection for this product
        const levelInspection = await prisma.level_inspections.findFirst({
            where: { product_id, is_active: true },
            orderBy: { valid_from: 'desc' }
        });

        if (!levelInspection) {
            throw new Error(`No active level inspection found for product ${product_id}`);
        }

        // Snapshot all AQL values at this moment in time
        return prisma.sample_inspections.create({
            data: {
                qc_phase,
                receiving_item_id: receiving_item_id || null,
                assembly_id: assembly_id || null,
                shipping_id: shipping_id || null,
                level_inspection_id: levelInspection.id,
                qc_template_id: levelInspection.qc_template_id || null,
                inspection_level: levelInspection.level,
                aql_critical: levelInspection.aql_critical,
                aql_major: levelInspection.aql_major,
                aql_minor: levelInspection.aql_minor,
                sample_size: levelInspection.sample_size || 0,
                accept_critical: levelInspection.accept_critical || 0,
                accept_major: levelInspection.accept_major || 0,
                accept_minor: levelInspection.accept_minor || 0,
                reject_critical: levelInspection.reject_critical ?? 1,
                reject_major: levelInspection.reject_major ?? 2,
                reject_minor: levelInspection.reject_minor ?? 4
            }
        });
    }

    async getSampleInspectionById(id) {
        return prisma.sample_inspections.findUnique({
            where: { id },
            include: {
                level_inspection: true,
                qc_template: { include: { checklist_items: { orderBy: { display_order: 'asc' } } } },
                qc_results: { select: { id: true, result: true, inspection_date: true } }
            }
        });
    }

    async getAllSampleInspections(options = {}) {
        const { page = 1, limit = 10, qc_phase, receiving_item_id, assembly_id } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (qc_phase) where.qc_phase = qc_phase;
        if (receiving_item_id) where.receiving_item_id = receiving_item_id;
        if (assembly_id) where.assembly_id = assembly_id;

        const [data, total] = await Promise.all([
            prisma.sample_inspections.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: 'desc' } }),
            prisma.sample_inspections.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    // ─── QC Result + Defects + Production Stop ─────────────────────────────────

    calculateResult(defectTotals, sampleInspection) {
        const { total_critical, total_major, total_minor } = defectTotals;
        const { reject_critical, reject_major, reject_minor, accept_critical, accept_major, accept_minor } = sampleInspection;

        const stops = [];

        if (total_critical >= reject_critical) stops.push({ reason: 'critical_exceeded', found: total_critical, limit: reject_critical });
        if (total_major >= reject_major) stops.push({ reason: 'major_exceeded', found: total_major, limit: reject_major });
        if (total_minor >= reject_minor) stops.push({ reason: 'minor_exceeded', found: total_minor, limit: reject_minor });

        if (stops.length > 0) return { result: 'fail', stops };

        const withinAccept =
            total_critical <= accept_critical &&
            total_major <= accept_major &&
            total_minor <= accept_minor;

        return { result: withinAccept ? 'pass' : 'conditional', stops: [] };
    }

    async createQcResult(data) {
        const {
            tracking_id, inspector_by, sample_inspection_id,
            qc_template_id, qc_place, notes,
            defects = [], // [{ defect_type_id, quantity, notes }]
            entity_type, entity_id // for production_stops
        } = data;

        // Fetch sample inspection for thresholds
        const sampleInspection = sample_inspection_id
            ? await prisma.sample_inspections.findUnique({ where: { id: sample_inspection_id } })
            : null;

        // Calculate defect totals per category
        let defectTotals = { total_critical: 0, total_major: 0, total_minor: 0 };
        if (defects.length > 0 && sampleInspection) {
            const defectTypes = await prisma.defect_types.findMany({
                where: { id: { in: defects.map(d => d.defect_type_id) } },
                select: { id: true, category: true }
            });
            const categoryMap = Object.fromEntries(defectTypes.map(d => [d.id, d.category]));

            for (const d of defects) {
                const cat = categoryMap[d.defect_type_id];
                if (cat === 'critical') defectTotals.total_critical += d.quantity || 1;
                else if (cat === 'major') defectTotals.total_major += d.quantity || 1;
                else if (cat === 'minor') defectTotals.total_minor += d.quantity || 1;
            }
        }

        // Determine result
        const { result, stops } = sampleInspection
            ? this.calculateResult(defectTotals, sampleInspection)
            : { result: 'pass', stops: [] };

        // Run as transaction
        return prisma.$transaction(async (tx) => {
            // 1. Create QC result
            const qcResult = await tx.qc_results.create({
                data: {
                    tracking_id,
                    inspector_by,
                    result,
                    sample_inspection_id: sample_inspection_id || null,
                    qc_template_id: qc_template_id || sampleInspection?.qc_template_id || null,
                    qc_place: qc_place || 'Unknown',
                    notes: notes || null
                }
            });

            // 2. Create defect records
            if (defects.length > 0) {
                await tx.qc_result_defects.createMany({
                    data: defects.map(d => ({
                        qc_result_id: qcResult.id,
                        defect_type_id: d.defect_type_id,
                        quantity: d.quantity || 1,
                        notes: d.notes || null
                    }))
                });
            }

            // 3. Create production stops if threshold exceeded
            for (const stop of stops) {
                await tx.production_stops.create({
                    data: {
                        entity_type: entity_type || 'unknown',
                        entity_id: entity_id || tracking_id,
                        qc_result_id: qcResult.id,
                        reason: stop.reason,
                        critical_found: defectTotals.total_critical,
                        major_found: defectTotals.total_major,
                        minor_found: defectTotals.total_minor,
                        reject_critical: sampleInspection?.reject_critical || 0,
                        reject_major: sampleInspection?.reject_major || 0,
                        reject_minor: sampleInspection?.reject_minor || 0
                    }
                });
            }

            // 4. Update tracking status
            const newStatus = result === 'fail' ? 'qc_failed' : 'qc_passed';
            await tx.tracking.update({ where: { id: tracking_id }, data: { status: newStatus } });

            return { qcResult, defect_totals: defectTotals, result, production_stops_created: stops.length };
        });
    }

    async getAllQcResults(options = {}) {
        const { page = 1, limit = 10, tracking_id, result } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (tracking_id) where.tracking_id = tracking_id;
        if (result) where.result = result;

        const [data, total] = await Promise.all([
            prisma.qc_results.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { inspection_date: 'desc' },
                include: {
                    defects: { include: { defect_type: { select: { id: true, name: true, category: true } } } },
                    production_stops: { select: { id: true, reason: true, resolved_at: true } }
                }
            }),
            prisma.qc_results.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getQcResultById(id) {
        return prisma.qc_results.findUnique({
            where: { id },
            include: {
                defects: { include: { defect_type: true } },
                production_stops: true,
                sample_inspection: true,
                qc_template: { include: { checklist_items: { orderBy: { display_order: 'asc' } } } }
            }
        });
    }

    // ─── QC Result Defects (standalone add/update/delete) ─────────────────────

    async addDefect(qcResultId, data) {
        return prisma.qc_result_defects.create({
            data: { qc_result_id: qcResultId, ...data }
        });
    }

    async updateDefect(defectId, data) {
        return prisma.qc_result_defects.update({ where: { id: defectId }, data });
    }

    async deleteDefect(defectId) {
        return prisma.qc_result_defects.delete({ where: { id: defectId } });
    }

    // ─── Production Stops ─────────────────────────────────────────────────────

    async getAllProductionStops(options = {}) {
        const { page = 1, limit = 10, entity_type, entity_id, unresolved_only } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (entity_type) where.entity_type = entity_type;
        if (entity_id) where.entity_id = entity_id;
        if (unresolved_only) where.resolved_at = null;

        const [data, total] = await Promise.all([
            prisma.production_stops.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    qc_result: { select: { id: true, result: true, inspection_date: true } },
                    triggered_user: { select: { id: true, name: true } }
                }
            }),
            prisma.production_stops.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async resolveProductionStop(id, data) {
        return prisma.production_stops.update({
            where: { id },
            data: {
                resolved_at: new Date(),
                resolution_notes: data.resolution_notes || null,
                triggered_by: data.resolved_by || null
            }
        });
    }
}

module.exports = new QcResultService();
