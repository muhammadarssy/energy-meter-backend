const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class ReceivingHeaderService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            status, batch_id, purchase_order_id,
            search = '',
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (status) where.status = status;
        if (batch_id) where.batch_id = batch_id;
        if (purchase_order_id) where.purchase_order_id = purchase_order_id;
        if (search) {
            where.OR = [
                { gr_number: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [data, total] = await Promise.all([
            prisma.receiving_headers.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    batch: { select: { id: true, code: true } },
                    purchase_order: { select: { id: true, po_number: true } }
                }
            }),
            prisma.receiving_headers.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.receiving_headers.findFirst({
            where: { id, deleted_at: null },
            include: {
                batch: true,
                purchase_order: true,
                receiving_items: {
                    include: {
                        product: { select: { id: true, name: true, sap_code: true } },
                        serial_stagings: { select: { id: true, serial_number: true, scanned_at: true } }
                    }
                }
            }
        });
    }

    async create(data) {
        return prisma.receiving_headers.create({ data });
    }

    async update(id, data) {
        return prisma.receiving_headers.update({ where: { id }, data });
    }

    async softDelete(id) {
        return prisma.receiving_headers.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}

module.exports = new ReceivingHeaderService();
