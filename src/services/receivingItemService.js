const prisma = require('../config/database');

class ReceivingItemService {
    async getByHeader(headerId) {
        return prisma.receiving_items.findMany({
            where: { receiving_header_id: headerId },
            include: {
                product: { select: { id: true, name: true, sap_code: true, is_serialize: true } },
                serial_stagings: {
                    select: { id: true, serial_number: true, scanned_at: true, scanned_by: true },
                    orderBy: { scanned_at: 'asc' }
                }
            }
        });
    }

    async getById(id) {
        return prisma.receiving_items.findUnique({
            where: { id },
            include: {
                receiving_header: { select: { id: true, gr_number: true, status: true } },
                product: { select: { id: true, name: true, sap_code: true } },
                serial_stagings: {
                    orderBy: { scanned_at: 'asc' }
                }
            }
        });
    }

    async create(headerId, data) {
        return prisma.receiving_items.create({
            data: { ...data, receiving_header_id: headerId },
            include: { product: { select: { id: true, name: true } } }
        });
    }

    async createBulk(headerId, items) {
        return prisma.$transaction(
            items.map(item =>
                prisma.receiving_items.create({
                    data: { ...item, receiving_header_id: headerId }
                })
            )
        );
    }

    async update(id, data) {
        return prisma.receiving_items.update({ where: { id }, data });
    }

    async delete(id) {
        return prisma.receiving_items.delete({ where: { id } });
    }
}

module.exports = new ReceivingItemService();
