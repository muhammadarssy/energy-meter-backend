const prisma = require('../config/database');

class SerialStagingService {
    async getCountStatus(itemId) {
        const [item, scanned] = await Promise.all([
            prisma.receiving_items.findUnique({
                where: { id: itemId },
                select: { id: true, quantity: true, is_serialized: true }
            }),
            prisma.serial_stagings.count({ where: { receiving_item_id: itemId } })
        ]);

        if (!item) return null;

        return {
            receiving_item_id: itemId,
            declared_quantity: item.quantity,
            scanned_count: scanned,
            remaining: item.quantity - scanned,
            is_complete: scanned === item.quantity,
            is_over: scanned > item.quantity
        };
    }

    async getByItem(itemId) {
        const [serials, status] = await Promise.all([
            prisma.serial_stagings.findMany({
                where: { receiving_item_id: itemId },
                include: {
                    scanner: { select: { id: true, name: true } }
                },
                orderBy: { scanned_at: 'asc' }
            }),
            this.getCountStatus(itemId)
        ]);

        return { ...status, serials };
    }

    async scanSerial(itemId, serialNumber, scannedBy) {
        // Buat entry — @unique pada serial_number akan tolak duplikat
        const serial = await prisma.serial_stagings.create({
            data: {
                receiving_item_id: itemId,
                serial_number: serialNumber,
                scanned_by: scannedBy || null,
                scanned_at: new Date()
            }
        });

        const status = await this.getCountStatus(itemId);
        return { serial, ...status };
    }

    async scanBulk(itemId, serialNumbers, scannedBy) {
        const results = [];
        const errors = [];

        for (const sn of serialNumbers) {
            try {
                const serial = await prisma.serial_stagings.create({
                    data: {
                        receiving_item_id: itemId,
                        serial_number: sn,
                        scanned_by: scannedBy || null,
                        scanned_at: new Date()
                    }
                });
                results.push({ serial_number: sn, status: 'ok', id: serial.id });
            } catch (err) {
                if (err.code === 'P2002') {
                    errors.push({ serial_number: sn, status: 'duplicate' });
                } else {
                    errors.push({ serial_number: sn, status: 'error', message: err.message });
                }
            }
        }

        const status = await this.getCountStatus(itemId);
        return { scanned: results, errors, ...status };
    }

    async deleteSerial(serialId) {
        return prisma.serial_stagings.delete({ where: { id: serialId } });
    }
}

module.exports = new SerialStagingService();
