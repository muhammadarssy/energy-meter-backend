const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class WarehouseRequestService {
    async getAll(options = {}) {
        const { page = 1, limit = 10, request_type, status, warehouse_id } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (request_type) where.request_type = request_type;
        if (status) where.status = status;
        if (warehouse_id) where.warehouse_id = warehouse_id;

        const [data, total] = await Promise.all([
            prisma.warehouse_requests.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    warehouse: { select: { id: true, name: true } },
                    receiving_header: { select: { id: true, gr_number: true, status: true } },
                    assembly_order: { select: { id: true, status: true } }
                }
            }),
            prisma.warehouse_requests.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.warehouse_requests.findUnique({
            where: { id },
            include: {
                warehouse: true,
                receiving_header: { include: { receiving_items: { include: { product: true } } } },
                assembly_order: true,
                approver: { select: { id: true, name: true } }
            }
        });
    }

    async create(data) {
        return prisma.warehouse_requests.create({ data: { ...data, status: 'pending' } });
    }

    async approveInboundReceiving(requestId, approvedBy) {
        const warehouseRequest = await prisma.warehouse_requests.findUnique({
            where: { id: requestId },
            include: {
                receiving_header: {
                    include: {
                        receiving_items: { include: { product: true } }
                    }
                }
            }
        });

        if (!warehouseRequest) throw new Error('Warehouse request not found');
        if (warehouseRequest.status !== 'pending') throw new Error('Request is not in pending status');

        const { warehouse_id, receiving_header } = warehouseRequest;

        return prisma.$transaction(async (tx) => {
            // 1. Approve the request
            await tx.warehouse_requests.update({
                where: { id: requestId },
                data: { status: 'approved', approved_by: approvedBy, approved_at: new Date() }
            });

            // 2. Update receiving header status
            await tx.receiving_headers.update({
                where: { id: receiving_header.id },
                data: { status: 'accept' }
            });

            // 3. For each receiving item → upsert stock_units + create stock_transactions
            for (const item of receiving_header.receiving_items) {
                const existingStock = await tx.stock_units.findFirst({
                    where: { product_id: item.product_id, warehouse_id }
                });

                if (existingStock) {
                    await tx.stock_units.update({
                        where: { id: existingStock.id },
                        data: { quantity: { increment: item.quantity } }
                    });
                } else {
                    await tx.stock_units.create({
                        data: {
                            product_id: item.product_id,
                            warehouse_id,
                            quantity: item.quantity,
                            quantity_reserved: 0
                        }
                    });
                }

                await tx.stock_transactions.create({
                    data: {
                        product_id: item.product_id,
                        warehouse_id,
                        movement_type: 'IN',
                        quantity: item.quantity,
                        reference_type: 'receiving_header',
                        reference_id: receiving_header.id
                    }
                });
            }

            // 4. Update all related tracking items to stored
            await tx.tracking.updateMany({
                where: { receiving_item_id: { in: receiving_header.receiving_items.map(i => i.id) } },
                data: { status: 'stored' }
            });

            return { requestId, status: 'approved', items_processed: receiving_header.receiving_items.length };
        });
    }

    async approveInboundAssembly(requestId, approvedBy) {
        const warehouseRequest = await prisma.warehouse_requests.findUnique({
            where: { id: requestId },
            include: {
                assembly_order: true
            }
        });

        if (!warehouseRequest) throw new Error('Warehouse request not found');
        if (warehouseRequest.status !== 'pending') throw new Error('Request is not in pending status');

        const { warehouse_id, assembly_order } = warehouseRequest;

        return prisma.$transaction(async (tx) => {
            // 1. Approve the request
            await tx.warehouse_requests.update({
                where: { id: requestId },
                data: { status: 'approved', approved_by: approvedBy, approved_at: new Date() }
            });

            // 2. Upsert stock_units for the finished good
            const existingStock = await tx.stock_units.findFirst({
                where: { product_id: assembly_order.product_id, warehouse_id }
            });

            if (existingStock) {
                await tx.stock_units.update({
                    where: { id: existingStock.id },
                    data: { quantity: { increment: assembly_order.quantity } }
                });
            } else {
                await tx.stock_units.create({
                    data: {
                        product_id: assembly_order.product_id,
                        warehouse_id,
                        quantity: assembly_order.quantity,
                        quantity_reserved: 0
                    }
                });
            }

            // 3. Create stock transaction
            await tx.stock_transactions.create({
                data: {
                    product_id: assembly_order.product_id,
                    warehouse_id,
                    movement_type: 'IN',
                    quantity: assembly_order.quantity,
                    reference_type: 'assembly_order',
                    reference_id: assembly_order.id
                }
            });

            // 4. Update tracking for finished goods
            await tx.tracking.updateMany({
                where: { assembly_id: assembly_order.id },
                data: { status: 'stored' }
            });

            return { requestId, status: 'approved', product_id: assembly_order.product_id };
        });
    }

    async reject(requestId, rejectedBy, reason) {
        return prisma.warehouse_requests.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                approved_by: rejectedBy,
                approved_at: new Date(),
                notes: reason || null
            }
        });
    }
}

module.exports = new WarehouseRequestService();
