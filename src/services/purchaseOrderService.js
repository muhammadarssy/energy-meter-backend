const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class PurchaseOrderService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            search = '', status,
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (search) {
            where.OR = [
                { po_number: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            prisma.purchase_orders.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.purchase_orders.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.purchase_orders.findFirst({
            where: { id, deleted_at: null },
            include: {
                receiving_headers: {
                    where: { deleted_at: null },
                    select: { id: true, gr_number: true, status: true, received_date: true }
                }
            }
        });
    }

    async create(data) {
        return prisma.purchase_orders.create({ data });
    }

    async update(id, data) {
        return prisma.purchase_orders.update({ where: { id }, data });
    }

    async softDelete(id) {
        return prisma.purchase_orders.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}

module.exports = new PurchaseOrderService();
