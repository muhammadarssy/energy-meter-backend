const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class TrackingService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            tracking_type, status, product_id,
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = {};
        if (tracking_type) where.tracking_type = tracking_type;
        if (status) where.status = status;
        if (product_id) where.product_id = product_id;

        const [data, total] = await Promise.all([
            prisma.tracking.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    product: { select: { id: true, name: true, sap_code: true } }
                }
            }),
            prisma.tracking.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.tracking.findUnique({
            where: { id },
            include: {
                product: true,
                qc_results: {
                    include: {
                        defects: { include: { defect_type: true } },
                        production_stops: true
                    },
                    orderBy: { created_at: 'desc' }
                },
                pln_code: { select: { id: true, full_code: true, status: true } }
            }
        });
    }

    async create(data) {
        return prisma.tracking.create({ data });
    }

    async createFromReceivingItem(receivingItemId) {
        const item = await prisma.receiving_items.findUnique({
            where: { id: receivingItemId },
            include: { receiving_header: { select: { batch_id: true } } }
        });
        if (!item) throw new Error('Receiving item not found');

        return prisma.tracking.create({
            data: {
                tracking_type: 'receiving',
                status: 'created',
                product_id: item.product_id,
                receiving_item_id: receivingItemId,
                batch_id: item.receiving_header?.batch_id || null
            }
        });
    }

    async updateStatus(id, status) {
        return prisma.tracking.update({ where: { id }, data: { status } });
    }
}

module.exports = new TrackingService();
