const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class BatchService {
    async getAll(options = {}) {
        const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const where = {};

        if (search) {
            where.OR = [
                { batch_number: { contains: search, mode: 'insensitive' } },
                { supplier_batch_code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [data, total] = await Promise.all([
            prisma.batches.findMany({ where, skip, take: parseInt(limit), orderBy: { [sortBy]: sortOrder } }),
            prisma.batches.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.batches.findUnique({
            where: { id },
            include: {
                receiving_headers: {
                    where: { deleted_at: null },
                    select: { id: true, gr_number: true, status: true }
                }
            }
        });
    }

    async create(data) {
        return prisma.batches.create({ data });
    }

    async update(id, data) {
        return prisma.batches.update({ where: { id }, data });
    }
}

module.exports = new BatchService();
