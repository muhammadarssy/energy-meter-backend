const crypto = require('crypto');
const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class ReceivingHeaderService {
    async getAll(options = {}) {
        const {
            page = 1, limit = 10,
            batch_id, purchase_order_id,
            search = '',
            sortBy = 'created_at', sortOrder = 'desc'
        } = options;

        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

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
                    purchase_order: { select: { id: true, po_number: true } },
                    _count: { select: { confirmations: true } }
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
                },
                confirmations: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                    orderBy: { confirmed_at: 'desc' }
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

    // ─── Confirmations ────────────────────────────────────────────────────────

    async getConfirmationsByHeader(headerId) {
        return prisma.receiving_confirmations.findMany({
            where: { receiving_header_id: headerId },
            include: {
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { confirmed_at: 'desc' }
        });
    }

    async confirm(headerId, data) {
        const { confirmed_by, note } = data;

        // Load header dengan relasi yang diperlukan
        const header = await prisma.receiving_headers.findFirst({
            where: { id: headerId, deleted_at: null },
            include: {
                purchase_order: { select: { po_number: true } },
                receiving_items: {
                    include: {
                        serial_stagings: { select: { id: true, serial_number: true } }
                    }
                }
            }
        });

        if (!header) {
            const err = new Error('Receiving header not found');
            err.statusCode = 404;
            throw err;
        }

        const itemIds = header.receiving_items.map(i => i.id);

        // Cek idempotency: jika tracking sudah ada, tolak konfirmasi
        if (itemIds.length > 0) {
            const existingCount = await prisma.tracking.count({
                where: { receiving_item_id: { in: itemIds } }
            });
            if (existingCount > 0) {
                const err = new Error('Tracking untuk GR ini sudah di-generate sebelumnya. Konfirmasi tidak dapat diulang.');
                err.statusCode = 409;
                err.code = 'TRACKING_EXISTS';
                throw err;
            }
        }

        // Validasi: item serialized harus sudah di-scan penuh
        const incomplete = header.receiving_items.filter(
            item => item.is_serialized && item.serial_stagings.length < item.quantity
        );
        if (incomplete.length > 0) {
            const detail = incomplete
                .map(i => `Item (${i.serial_stagings.length}/${i.quantity} serial ter-scan)`)
                .join(', ');
            const err = new Error(`Serial number belum lengkap: ${detail}`);
            err.statusCode = 400;
            err.code = 'SERIAL_INCOMPLETE';
            throw err;
        }

        // Helper generate code_item: REC-{PO}-{GR}-{timestamp}-{random}
        const poSlug = header.purchase_order.po_number.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
        const grSlug = header.gr_number.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
        const makeCode = () => {
            const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
            return `REC-${poSlug}-${grSlug}-${Date.now()}-${rand}`;
        };

        // Bangun daftar tracking records
        const trackingRecords = [];
        for (const item of header.receiving_items) {
            if (item.is_serialized) {
                // 1 tracking per serial number
                for (const serial of item.serial_stagings) {
                    trackingRecords.push({
                        code_item: makeCode(),
                        is_serialize: true,
                        serial_number: serial.serial_number,
                        product_id: item.product_id,
                        batch_id: header.batch_id,
                        tracking_type: 'receiving',
                        status: 'created',
                        original_quantity: 1,
                        current_quantity: 1,
                        consumed_quantity: 0,
                        receiving_item_id: item.id
                    });
                }
            } else {
                // 1 tracking per item dengan total quantity
                trackingRecords.push({
                    code_item: makeCode(),
                    is_serialize: false,
                    serial_number: null,
                    product_id: item.product_id,
                    batch_id: header.batch_id,
                    tracking_type: 'receiving',
                    status: 'created',
                    original_quantity: item.quantity,
                    current_quantity: item.quantity,
                    consumed_quantity: 0,
                    receiving_item_id: item.id
                });
            }
        }

        // Jalankan dalam transaction: buat konfirmasi + semua tracking sekaligus
        const [confirmation] = await prisma.$transaction([
            prisma.receiving_confirmations.create({
                data: {
                    receiving_header_id: headerId,
                    confirmed_by,
                    note: note ?? null
                },
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            ...trackingRecords.map(td => prisma.tracking.create({ data: td }))
        ]);

        return confirmation;
    }
}

module.exports = new ReceivingHeaderService();
