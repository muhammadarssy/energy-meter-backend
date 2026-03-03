const prisma = require('../config/database');
const ChecksumCalculator = require('../utils/checksum');
const { createPaginationMeta } = require('../utils/response');

class PlnCodeService {

    // ─── Counter ──────────────────────────────────────────────────────────────

    /**
     * Atomically increment counter for a factory by `n`.
     * Returns the counter value AFTER increment (for the last code).
     * For bulk: codes use counter values (prev+1) ... (prev+n).
     */
    async _incrementCounter(tx, factoryId, n = 1) {
        const client = tx || prisma;
        const record = await client.meter_code_counters.upsert({
            where: { factory_id: factoryId },
            update: { last_counter: { increment: n } },
            create: { factory_id: factoryId, last_counter: n }
        });
        return record.last_counter; // value after increment
    }

    /**
     * Build partial code values from factory + counter.
     * tag = factory.code (4), meter_unique_code = counter zero-padded to 8 digits.
     * check_code = Luhn on (tag + meter_unique_code).
     */
    _buildPartial(factory, counter) {
        const tag = factory.code.padStart(4, '0');
        const meter_unique_code = String(counter).padStart(8, '0');
        const check_code = ChecksumCalculator.calculateCheckCode(tag + meter_unique_code);
        return { tag, meter_unique_code, check_code };
    }

    /**
     * Build full_code from material info + partial code.
     * Format: materialGroup(2) + subGroup(2) + variant(7) + tag(4) + meter_unique_code(8) + check_code(1)
     */
    _buildFullCode(materialGroup, materialSubGroup, variant, tag, meter_unique_code, check_code) {
        return (
            materialGroup.code.padStart(2, '0') +
            materialSubGroup.code.padStart(2, '0') +
            variant.code.padStart(7, '0') +
            tag +
            meter_unique_code +
            check_code
        );
    }

    // ─── PLN Code Generation ──────────────────────────────────────────────────

    async generatePartial(data) {
        const { factory_id, assembly_order_id, notes, created_by_id } = data;

        const factory = await prisma.factories.findUnique({ where: { id: factory_id } });
        if (!factory) throw new Error('Factory not found');

        return prisma.$transaction(async (tx) => {
            const newCounter = await this._incrementCounter(tx, factory_id, 1);
            const { tag, meter_unique_code, check_code } = this._buildPartial(factory, newCounter);

            return tx.pln_codes.create({
                data: {
                    factory_id,
                    tag,
                    meter_unique_code,
                    check_code,
                    status: 'PARTIAL',
                    assembly_order_id: assembly_order_id || null,
                    notes: notes || null,
                    created_by_id: created_by_id || null
                }
            });
        });
    }

    async bulkGeneratePartial(data) {
        const { factory_id, quantity, assembly_order_id, notes, created_by_id } = data;

        const factory = await prisma.factories.findUnique({ where: { id: factory_id } });
        if (!factory) throw new Error('Factory not found');

        return prisma.$transaction(async (tx) => {
            const lastCounter = await this._incrementCounter(tx, factory_id, quantity);
            const firstCounter = lastCounter - quantity + 1;

            const records = [];
            for (let i = 0; i < quantity; i++) {
                const counter = firstCounter + i;
                const { tag, meter_unique_code, check_code } = this._buildPartial(factory, counter);
                records.push({
                    factory_id,
                    tag,
                    meter_unique_code,
                    check_code,
                    status: 'PARTIAL',
                    assembly_order_id: assembly_order_id || null,
                    notes: notes || null,
                    created_by_id: created_by_id || null
                });
            }

            await tx.pln_codes.createMany({ data: records });
            return { generated: quantity, factory: factory.name };
        });
    }

    async addMaterialInfo(id, data) {
        const { material_group_id, material_sub_group_id, variant_id } = data;

        const code = await prisma.pln_codes.findUnique({ where: { id } });
        if (!code) throw new Error('PLN code not found');
        if (code.status !== 'PARTIAL') {
            throw Object.assign(
                new Error(`Cannot add material info to code with status ${code.status}`),
                { status: 400 }
            );
        }

        const [materialGroup, materialSubGroup, variant] = await Promise.all([
            prisma.material_groups.findUnique({ where: { id: material_group_id } }),
            prisma.material_sub_groups.findUnique({ where: { id: material_sub_group_id } }),
            prisma.variants.findUnique({ where: { id: variant_id } })
        ]);

        if (!materialGroup) throw new Error('Material group not found');
        if (!materialSubGroup) throw new Error('Material sub group not found');
        if (!variant) throw new Error('Variant not found');

        const full_code = this._buildFullCode(
            materialGroup, materialSubGroup, variant,
            code.tag, code.meter_unique_code, code.check_code
        );

        return prisma.pln_codes.update({
            where: { id },
            data: {
                material_group_id,
                material_sub_group_id,
                variant_id,
                full_code,
                status: 'MATERIAL_SELECTED'
            }
        });
    }

    async generateComplete(data) {
        const { factory_id, material_group_id, material_sub_group_id, variant_id,
            assembly_order_id, notes, created_by_id } = data;

        const [factory, materialGroup, materialSubGroup, variant] = await Promise.all([
            prisma.factories.findUnique({ where: { id: factory_id } }),
            prisma.material_groups.findUnique({ where: { id: material_group_id } }),
            prisma.material_sub_groups.findUnique({ where: { id: material_sub_group_id } }),
            prisma.variants.findUnique({ where: { id: variant_id } })
        ]);

        if (!factory) throw new Error('Factory not found');
        if (!materialGroup) throw new Error('Material group not found');
        if (!materialSubGroup) throw new Error('Material sub group not found');
        if (!variant) throw new Error('Variant not found');

        return prisma.$transaction(async (tx) => {
            const newCounter = await this._incrementCounter(tx, factory_id, 1);
            const { tag, meter_unique_code, check_code } = this._buildPartial(factory, newCounter);
            const full_code = this._buildFullCode(
                materialGroup, materialSubGroup, variant, tag, meter_unique_code, check_code
            );

            return tx.pln_codes.create({
                data: {
                    factory_id,
                    material_group_id,
                    material_sub_group_id,
                    variant_id,
                    tag,
                    meter_unique_code,
                    check_code,
                    full_code,
                    status: 'MATERIAL_SELECTED',
                    assembly_order_id: assembly_order_id || null,
                    notes: notes || null,
                    created_by_id: created_by_id || null
                }
            });
        });
    }

    async bulkGenerateComplete(data) {
        const { factory_id, material_group_id, material_sub_group_id, variant_id,
            quantity, assembly_order_id, notes, created_by_id } = data;

        const [factory, materialGroup, materialSubGroup, variant] = await Promise.all([
            prisma.factories.findUnique({ where: { id: factory_id } }),
            prisma.material_groups.findUnique({ where: { id: material_group_id } }),
            prisma.material_sub_groups.findUnique({ where: { id: material_sub_group_id } }),
            prisma.variants.findUnique({ where: { id: variant_id } })
        ]);

        if (!factory) throw new Error('Factory not found');
        if (!materialGroup) throw new Error('Material group not found');
        if (!materialSubGroup) throw new Error('Material sub group not found');
        if (!variant) throw new Error('Variant not found');

        return prisma.$transaction(async (tx) => {
            const lastCounter = await this._incrementCounter(tx, factory_id, quantity);
            const firstCounter = lastCounter - quantity + 1;

            const records = [];
            for (let i = 0; i < quantity; i++) {
                const counter = firstCounter + i;
                const { tag, meter_unique_code, check_code } = this._buildPartial(factory, counter);
                const full_code = this._buildFullCode(
                    materialGroup, materialSubGroup, variant, tag, meter_unique_code, check_code
                );
                records.push({
                    factory_id,
                    material_group_id,
                    material_sub_group_id,
                    variant_id,
                    tag,
                    meter_unique_code,
                    check_code,
                    full_code,
                    status: 'MATERIAL_SELECTED',
                    assembly_order_id: assembly_order_id || null,
                    notes: notes || null,
                    created_by_id: created_by_id || null
                });
            }

            await tx.pln_codes.createMany({ data: records });
            return { generated: quantity, factory: factory.name };
        });
    }

    // ─── Laser / Print ────────────────────────────────────────────────────────

    async markAsLasered(id, data) {
        const { lasered_by_id, laser_notes } = data;
        const code = await prisma.pln_codes.findUnique({ where: { id } });
        if (!code) throw new Error('PLN code not found');
        if (code.is_lasered) throw Object.assign(new Error('Code already lasered'), { status: 400 });

        return prisma.pln_codes.update({
            where: { id },
            data: {
                is_lasered: true,
                lasered_at: new Date(),
                status: 'LASERED',
                lasered_by_id: lasered_by_id || null,
                laser_notes: laser_notes || null
            }
        });
    }

    async bulkMarkAsLasered(data) {
        const { pln_code_ids, lasered_by_id, laser_notes } = data;
        return prisma.pln_codes.updateMany({
            where: {
                id: { in: pln_code_ids },
                is_lasered: false
            },
            data: {
                is_lasered: true,
                lasered_at: new Date(),
                status: 'LASERED',
                lasered_by_id: lasered_by_id || null,
                laser_notes: laser_notes || null
            }
        });
    }

    async markAsPrinted(id, data) {
        const { printed_by_id, print_notes } = data;
        const code = await prisma.pln_codes.findUnique({ where: { id } });
        if (!code) throw new Error('PLN code not found');
        if (code.is_printed) throw Object.assign(new Error('Code already printed'), { status: 400 });

        return prisma.pln_codes.update({
            where: { id },
            data: {
                is_printed: true,
                printed_at: new Date(),
                status: 'PRINTED',
                printed_by_id: printed_by_id || null,
                print_notes: print_notes || null
            }
        });
    }

    async bulkMarkAsPrinted(data) {
        const { pln_code_ids, printed_by_id, print_notes } = data;
        return prisma.pln_codes.updateMany({
            where: {
                id: { in: pln_code_ids },
                is_printed: false
            },
            data: {
                is_printed: true,
                printed_at: new Date(),
                status: 'PRINTED',
                printed_by_id: printed_by_id || null,
                print_notes: print_notes || null
            }
        });
    }

    // ─── Validate ─────────────────────────────────────────────────────────────

    validateCode(full_code) {
        const isValid = ChecksumCalculator.validateCheckCode(full_code);
        return { full_code, is_valid: isValid };
    }

    // ─── Box Management ───────────────────────────────────────────────────────

    async createBox(data) {
        const { assembly_order_id, capacity, notes, created_by_id } = data;

        // Auto-generate box_number: BOX-{timestamp}-{random 4 digits}
        const box_number = `BOX-${Date.now()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

        return prisma.boxes.create({
            data: {
                box_number,
                assembly_order_id,
                capacity: capacity || 12,
                notes: notes || null,
                created_by_id: created_by_id || null
            }
        });
    }

    async getBoxById(id) {
        return prisma.boxes.findUnique({
            where: { id },
            include: {
                pln_codes: { select: { id: true, full_code: true, tag: true, meter_unique_code: true, status: true } },
                assembly_order: { select: { id: true } }
            }
        });
    }

    async getBoxes(options = {}) {
        const { page = 1, limit = 10, status, assembly_order_id } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) where.status = status;
        if (assembly_order_id) where.assembly_order_id = assembly_order_id;

        const [data, total] = await Promise.all([
            prisma.boxes.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    _count: { select: { pln_codes: true } }
                }
            }),
            prisma.boxes.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async assignToBox(data) {
        const { pln_code_ids, box_id } = data;

        const box = await prisma.boxes.findUnique({
            where: { id: box_id },
            include: { _count: { select: { pln_codes: true } } }
        });
        if (!box) throw new Error('Box not found');
        if (box.status === 'SEALED') throw Object.assign(new Error('Box is already sealed'), { status: 400 });

        const currentCount = box._count.pln_codes;
        if (currentCount + pln_code_ids.length > box.capacity) {
            throw Object.assign(
                new Error(`Box capacity exceeded. Capacity: ${box.capacity}, current: ${currentCount}, adding: ${pln_code_ids.length}`),
                { status: 400 }
            );
        }

        return prisma.pln_codes.updateMany({
            where: { id: { in: pln_code_ids } },
            data: { box_id, status: 'BOXED' }
        });
    }

    async sealBox(id, data) {
        const { sealed_by_id } = data;
        const box = await prisma.boxes.findUnique({ where: { id } });
        if (!box) throw new Error('Box not found');
        if (box.status === 'SEALED') throw Object.assign(new Error('Box is already sealed'), { status: 400 });

        return prisma.boxes.update({
            where: { id },
            data: {
                status: 'SEALED',
                sealed_at: new Date(),
                sealed_by_id: sealed_by_id || null
            }
        });
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    async getAll(options = {}) {
        const { page = 1, limit = 10, status, factory_id, is_lasered, is_printed, assembly_order_id } = options;
        const skip = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (factory_id) where.factory_id = factory_id;
        if (assembly_order_id) where.assembly_order_id = assembly_order_id;
        if (is_lasered !== undefined) where.is_lasered = is_lasered;
        if (is_printed !== undefined) where.is_printed = is_printed;

        const [data, total] = await Promise.all([
            prisma.pln_codes.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { generated_at: 'desc' },
                include: {
                    factory: { select: { id: true, code: true, name: true } },
                    material_group: { select: { id: true, code: true, name: true } },
                    material_sub_group: { select: { id: true, code: true, name: true } },
                    variant: { select: { id: true, code: true, name: true } }
                }
            }),
            prisma.pln_codes.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.pln_codes.findUnique({
            where: { id },
            include: {
                factory: true,
                material_group: true,
                material_sub_group: true,
                variant: true,
                box: true,
                assembly_order: { select: { id: true, status: true } }
            }
        });
    }

    async getByFullCode(full_code) {
        return prisma.pln_codes.findUnique({
            where: { full_code },
            include: {
                factory: true,
                material_group: true,
                material_sub_group: true,
                variant: true,
                box: true
            }
        });
    }

    // ─── Unlasered / Unprinted ────────────────────────────────────────────────

    async getUnlasered(options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = { is_lasered: false, status: 'MATERIAL_SELECTED' };

        const [data, total] = await Promise.all([
            prisma.pln_codes.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { generated_at: 'asc' },
                include: { factory: { select: { id: true, code: true, name: true } } }
            }),
            prisma.pln_codes.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getUnprinted(options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = { is_printed: false, status: 'LASERED' };

        const [data, total] = await Promise.all([
            prisma.pln_codes.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { generated_at: 'asc' },
                include: { factory: { select: { id: true, code: true, name: true } } }
            }),
            prisma.pln_codes.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }
}

module.exports = new PlnCodeService();
