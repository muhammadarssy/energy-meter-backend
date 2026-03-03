const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');

class AssemblyService {
    // ─── PLN Orders ───────────────────────────────────────────────────────────

    async getAllPlnOrders(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) where.order_number = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            prisma.pln_orders.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: { assembly_orders: { select: { id: true, status: true, quantity: true } } }
            }),
            prisma.pln_orders.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getPlnOrderById(id) {
        return prisma.pln_orders.findUnique({
            where: { id },
            include: { assembly_orders: true }
        });
    }

    async createPlnOrder(data) {
        return prisma.pln_orders.create({ data });
    }

    async updatePlnOrder(id, data) {
        return prisma.pln_orders.update({ where: { id }, data });
    }

    // ─── Assembly Orders ──────────────────────────────────────────────────────

    async getAllAssemblyOrders(options = {}) {
        const { page = 1, limit = 10, status, product_id } = options;
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };
        if (status) where.status = status;
        if (product_id) where.product_id = product_id;

        const [data, total] = await Promise.all([
            prisma.assembly_orders.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    product: { select: { id: true, name: true, sap_code: true } },
                    pln_order: { select: { id: true, order_number: true } }
                }
            }),
            prisma.assembly_orders.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getAssemblyOrderById(id) {
        return prisma.assembly_orders.findFirst({
            where: { id, deleted_at: null },
            include: {
                product: true,
                pln_order: true,
                items: {
                    include: { component: { select: { id: true, name: true, sap_code: true } } }
                },
                confirmations: {
                    include: {
                        item_confirmations: {
                            include: {
                                stock_unit: { select: { id: true, quantity: true } }
                            }
                        }
                    }
                }
            }
        });
    }

    async createAssemblyOrder(data) {
        return prisma.assembly_orders.create({
            data: { ...data, status: 'pending' }
        });
    }

    async updateAssemblyOrder(id, data) {
        return prisma.assembly_orders.update({ where: { id }, data });
    }

    async softDeleteAssemblyOrder(id) {
        return prisma.assembly_orders.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    // ─── Assembly Order Items ─────────────────────────────────────────────────

    async getItemsByOrder(orderId) {
        return prisma.assembly_order_items.findMany({
            where: { assembly_order_id: orderId },
            include: { component: { select: { id: true, name: true, sap_code: true } } }
        });
    }

    async addItem(orderId, data) {
        return prisma.assembly_order_items.create({
            data: { ...data, assembly_order_id: orderId }
        });
    }

    async addItemsBulk(orderId, items) {
        return prisma.$transaction(
            items.map(item =>
                prisma.assembly_order_items.create({
                    data: { ...item, assembly_order_id: orderId }
                })
            )
        );
    }

    async updateItem(itemId, data) {
        return prisma.assembly_order_items.update({ where: { id: itemId }, data });
    }

    async deleteItem(itemId) {
        return prisma.assembly_order_items.delete({ where: { id: itemId } });
    }

    // ─── Assembly Confirmations ───────────────────────────────────────────────

    async getConfirmationsByOrder(orderId) {
        return prisma.assembly_order_confirmations.findMany({
            where: { assembly_order_id: orderId },
            include: {
                item_confirmations: {
                    include: {
                        component: { select: { id: true, name: true } },
                        stock_unit: { select: { id: true, quantity: true, quantity_reserved: true } }
                    }
                }
            }
        });
    }

    async confirmItem(orderId, data) {
        const { component_id, stock_unit_id, qty_confirmed } = data;

        // Check stock availability
        const stockUnit = await prisma.stock_units.findUnique({ where: { id: stock_unit_id } });
        if (!stockUnit) throw new Error('Stock unit not found');

        const availableQty = stockUnit.quantity - stockUnit.quantity_reserved;
        if (availableQty < qty_confirmed) {
            throw new Error(`Insufficient stock. Available: ${availableQty}, requested: ${qty_confirmed}`);
        }

        return prisma.$transaction(async (tx) => {
            // 1. Create stock transaction RESERVED
            const stockTx = await tx.stock_transactions.create({
                data: {
                    product_id: stockUnit.product_id,
                    warehouse_id: stockUnit.warehouse_id,
                    movement_type: 'RESERVED',
                    quantity: qty_confirmed,
                    reference_type: 'assembly_order',
                    reference_id: orderId
                }
            });

            // 2. Update stock reserved
            await tx.stock_units.update({
                where: { id: stock_unit_id },
                data: { quantity_reserved: { increment: qty_confirmed } }
            });

            // 3. Create item confirmation
            const itemConfirmation = await tx.assembly_order_item_confirmations.create({
                data: {
                    assembly_order_id: orderId,
                    component_id,
                    stock_unit_id,
                    qty_confirmed,
                    stock_transaction_id: stockTx.id
                }
            });

            return { itemConfirmation, stockTransaction: stockTx };
        });
    }

    async startAssemblyOrder(orderId) {
        return prisma.assembly_orders.update({
            where: { id: orderId },
            data: { status: 'in_progress', started_at: new Date() }
        });
    }

    // ─── Assembly Process (create tracking + record components) ──────────────

    async processAssembly(orderId, data) {
        const { pln_code_id, components = [] } = data;
        const order = await prisma.assembly_orders.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
        if (!order) throw new Error('Assembly order not found');

        return prisma.$transaction(async (tx) => {
            // 1. Create tracking for finished good
            const tracking = await tx.tracking.create({
                data: {
                    tracking_type: 'assembly',
                    status: 'created',
                    product_id: order.product_id,
                    assembly_id: orderId,
                    pln_code_id: pln_code_id || null
                }
            });

            // 2. Record assembly components
            if (components.length > 0) {
                await tx.assembly_components.createMany({
                    data: components.map(c => ({
                        parent_tracking_id: tracking.id,
                        component_tracking_id: c.component_tracking_id,
                        quantity: c.quantity || 1
                    }))
                });
            }

            // 3. Convert RESERVED → OUT for each confirmed component
            const confirmations = await tx.assembly_order_item_confirmations.findMany({
                where: { assembly_order_id: orderId },
                include: { stock_unit: true }
            });

            for (const conf of confirmations) {
                // Create OUT transaction
                await tx.stock_transactions.create({
                    data: {
                        product_id: conf.stock_unit.product_id,
                        warehouse_id: conf.stock_unit.warehouse_id,
                        movement_type: 'OUT',
                        quantity: conf.qty_confirmed,
                        reference_type: 'assembly_order',
                        reference_id: orderId
                    }
                });

                // Reduce stock and reserved
                await tx.stock_units.update({
                    where: { id: conf.stock_unit_id },
                    data: {
                        quantity: { decrement: conf.qty_confirmed },
                        quantity_reserved: { decrement: conf.qty_confirmed }
                    }
                });
            }

            return { tracking, components_recorded: components.length, stock_updated: confirmations.length };
        });
    }

    async completeAssemblyOrder(orderId) {
        return prisma.assembly_orders.update({
            where: { id: orderId },
            data: { status: 'completed', completed_at: new Date() }
        });
    }
}

module.exports = new AssemblyService();
