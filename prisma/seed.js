/**
 * Seed file — Energy Meter Unified Backend
 *
 * Scenario:
 *   - 1 Product (Meter Listrik 3-Phase) with 3 QC stages (level_inspections)
 *   - 1 Receiving with 3 serialized units (SN-EM-001, SN-EM-002, SN-EM-003)
 *   - SN-EM-001: Stage 1 PASS, Stage 2 in_progress, Stage 3 pending
 *   - SN-EM-002: All 3 stages pending
 *   - SN-EM-003: Stage 1 PASS, Stage 2 PASS, Stage 3 FAIL
 *
 * Run: node prisma/seed.js
 *       OR add "seed" script to package.json then: npx prisma db seed
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// ── Fixed IDs (deterministic re-runs) ────────────────────────────────────────
const IDS = {
    // Users
    adminUser:       'aaaaaaaa-0000-0000-0000-000000000001',
    inspectorUser:   'aaaaaaaa-0000-0000-0000-000000000002',

    // Master data
    supplier:        'bbbbbbbb-0000-0000-0000-000000000001',
    productType:     'cccccccc-0000-0000-0000-000000000001',
    productCategory: 'dddddddd-0000-0000-0000-000000000001',
    product:         'eeeeeeee-0000-0000-0000-000000000001',

    // QC Master
    qcTemplate1:     'ffffffff-0000-0000-0000-000000000001', // QC Fisik
    qcTemplate2:     'ffffffff-0000-0000-0000-000000000002', // QC Fungsional
    qcTemplate3:     'ffffffff-0000-0000-0000-000000000003', // QC Keamanan
    defectType1:     '11111111-0000-0000-0000-000000000001', // Cacat Fisik
    defectType2:     '11111111-0000-0000-0000-000000000002', // Tidak Berfungsi
    defectType3:     '11111111-0000-0000-0000-000000000003', // Kabel Terkelupas

    // Level Inspections (3 stages per product)
    levelInsp1:      '22222222-0000-0000-0000-000000000001', // → qcTemplate1
    levelInsp2:      '22222222-0000-0000-0000-000000000002', // → qcTemplate2
    levelInsp3:      '22222222-0000-0000-0000-000000000003', // → qcTemplate3

    // Warehouse
    warehouse:       '33333333-0000-0000-0000-000000000001',

    // Receiving
    batch:           '44444444-0000-0000-0000-000000000001',
    purchaseOrder:   '55555555-0000-0000-0000-000000000001',
    receivingHeader: '66666666-0000-0000-0000-000000000001',
    receivingItem:   '77777777-0000-0000-0000-000000000001',

    // Serial stagings
    serial1: '88888888-0000-0000-0000-000000000001',
    serial2: '88888888-0000-0000-0000-000000000002',
    serial3: '88888888-0000-0000-0000-000000000003',

    // Tracking
    tracking1: '99999999-0000-0000-0000-000000000001',
    tracking2: '99999999-0000-0000-0000-000000000002',
    tracking3: '99999999-0000-0000-0000-000000000003',

    // Sample inspections (SN-EM-001)
    sampleInsp1a: 'aaaaaaaa-1111-0000-0000-000000000001', // SN-001 Stage 1
    sampleInsp1b: 'aaaaaaaa-1111-0000-0000-000000000002', // SN-001 Stage 2

    // Sample inspections (SN-EM-003)
    sampleInsp3a: 'aaaaaaaa-3333-0000-0000-000000000001', // SN-003 Stage 1
    sampleInsp3b: 'aaaaaaaa-3333-0000-0000-000000000002', // SN-003 Stage 2
    sampleInsp3c: 'aaaaaaaa-3333-0000-0000-000000000003', // SN-003 Stage 3

    // QC Results
    qcResult1a: 'bbbbbbbb-1111-0000-0000-000000000001', // SN-001 Stage 1 PASS
    qcResult3a: 'bbbbbbbb-3333-0000-0000-000000000001', // SN-003 Stage 1 PASS
    qcResult3b: 'bbbbbbbb-3333-0000-0000-000000000002', // SN-003 Stage 2 PASS
    qcResult3c: 'bbbbbbbb-3333-0000-0000-000000000003', // SN-003 Stage 3 FAIL
};

async function main() {
    console.log('🌱 Seeding database...\n');

    const passwordHash = bcrypt.hashSync('Password123!', 10);

    // ── 1. Users ──────────────────────────────────────────────────────────────
    console.log('👤 Creating users...');
    await prisma.users.upsert({
        where: { id: IDS.adminUser },
        update: {},
        create: {
            id: IDS.adminUser,
            name: 'Admin Sistem',
            username: 'admin',
            email: 'admin@energymeter.id',
            password: passwordHash,
            department: 'IT',
            is_active: true
        }
    });

    await prisma.users.upsert({
        where: { id: IDS.inspectorUser },
        update: {},
        create: {
            id: IDS.inspectorUser,
            name: 'QC Inspector',
            username: 'inspector',
            email: 'inspector@energymeter.id',
            password: passwordHash,
            department: 'Quality Control',
            is_active: true
        }
    });

    // ── 2. Master Data ────────────────────────────────────────────────────────
    console.log('📦 Creating master data...');
    await prisma.suppliers.upsert({
        where: { id: IDS.supplier },
        update: {},
        create: {
            id: IDS.supplier,
            code: 'SUP-001',
            name: 'PT Manufaktur Meter',
            contact_name: 'Budi Santoso',
            contact_email: 'budi@manufaktur.id',
            contact_phone: '08112345678',
            is_active: true
        }
    });

    await prisma.product_types.upsert({
        where: { id: IDS.productType },
        update: {},
        create: {
            id: IDS.productType,
            code: 'TYPE-METER',
            name: 'Meter Listrik',
            description: 'Kategori produk meter listrik PLN',
            is_active: true
        }
    });

    await prisma.product_categories.upsert({
        where: { id: IDS.productCategory },
        update: {},
        create: {
            id: IDS.productCategory,
            code: 'CAT-3PHASE',
            name: '3-Phase',
            description: 'Meter listrik tiga fase',
            is_active: true
        }
    });

    await prisma.products.upsert({
        where: { id: IDS.product },
        update: {},
        create: {
            id: IDS.product,
            sap_code: 'SAP-EM-3P-001',
            name: 'Meter Listrik 3-Phase 10A',
            description: 'Meter listrik 3 phase kapasitas 10 Ampere',
            product_type_id: IDS.productType,
            supplier_id: IDS.supplier,
            is_serialize: true,
            is_qc: true,
            is_active: true
        }
    });

    // product → category mapping
    await prisma.product_category_mappings.upsert({
        where: { product_id_category_id: { product_id: IDS.product, category_id: IDS.productCategory } },
        update: {},
        create: { product_id: IDS.product, category_id: IDS.productCategory }
    });

    // ── 3. QC Master Data ─────────────────────────────────────────────────────
    console.log('🔍 Creating QC master data...');

    // Defect types
    await prisma.defect_types.upsert({
        where: { id: IDS.defectType1 },
        update: {},
        create: {
            id: IDS.defectType1,
            code: 'DEF-FISIK',
            name: 'Cacat Fisik',
            category: 'major',
            description: 'Kerusakan tampilan fisik: goresan, retak, penyok',
            is_active: true
        }
    });

    await prisma.defect_types.upsert({
        where: { id: IDS.defectType2 },
        update: {},
        create: {
            id: IDS.defectType2,
            code: 'DEF-FUNGSI',
            name: 'Tidak Berfungsi',
            category: 'critical',
            description: 'Meter tidak dapat melakukan pengukuran',
            is_active: true
        }
    });

    await prisma.defect_types.upsert({
        where: { id: IDS.defectType3 },
        update: {},
        create: {
            id: IDS.defectType3,
            code: 'DEF-KABEL',
            name: 'Kabel Terkelupas',
            category: 'critical',
            description: 'Insulasi kabel terkelupas, berpotensi bahaya listrik',
            is_active: true
        }
    });

    // QC Templates
    await prisma.qc_templates.upsert({
        where: { id: IDS.qcTemplate1 },
        update: {},
        create: {
            id: IDS.qcTemplate1,
            code: 'QC-FISIK',
            name: 'QC Pemeriksaan Fisik',
            description: 'Pemeriksaan kondisi fisik unit meter',
            qc_phase: 'receiving',
            display_order: 1,
            is_active: true
        }
    });

    await prisma.qc_templates.upsert({
        where: { id: IDS.qcTemplate2 },
        update: {},
        create: {
            id: IDS.qcTemplate2,
            code: 'QC-FUNGSI',
            name: 'QC Fungsional',
            description: 'Pemeriksaan fungsi pengukuran dan akurasi meter',
            qc_phase: 'receiving',
            display_order: 2,
            is_active: true
        }
    });

    await prisma.qc_templates.upsert({
        where: { id: IDS.qcTemplate3 },
        update: {},
        create: {
            id: IDS.qcTemplate3,
            code: 'QC-KEAMANAN',
            name: 'QC Keamanan Listrik',
            description: 'Pemeriksaan keamanan instalasi dan isolasi listrik',
            qc_phase: 'receiving',
            display_order: 3,
            is_active: true
        }
    });

    // Checklist items per template
    const checklistData = [
        // Template 1 — Fisik
        { qc_template_id: IDS.qcTemplate1, label: 'Cek kondisi housing/casing tidak retak', display_order: 1, is_required: true },
        { qc_template_id: IDS.qcTemplate1, label: 'Cek layar LCD tidak pecah atau buram', display_order: 2, is_required: true },
        { qc_template_id: IDS.qcTemplate1, label: 'Cek segel pabrik masih utuh', display_order: 3, is_required: true },
        { qc_template_id: IDS.qcTemplate1, label: 'Cek label/stiker nomor seri terbaca jelas', display_order: 4, is_required: true },
        // Template 2 — Fungsional
        { qc_template_id: IDS.qcTemplate2, label: 'Cek tegangan masukan sesuai spesifikasi (220V)', display_order: 1, is_required: true },
        { qc_template_id: IDS.qcTemplate2, label: 'Cek akurasi pengukuran KWh ≤ ±1%', display_order: 2, is_required: true },
        { qc_template_id: IDS.qcTemplate2, label: 'Cek komunikasi DLMS/COSEM berjalan normal', display_order: 3, is_required: true },
        // Template 3 — Keamanan
        { qc_template_id: IDS.qcTemplate3, label: 'Cek resistansi isolasi ≥ 10 MΩ', display_order: 1, is_required: true },
        { qc_template_id: IDS.qcTemplate3, label: 'Cek tidak ada kabel terkelupas atau putus', display_order: 2, is_required: true },
        { qc_template_id: IDS.qcTemplate3, label: 'Cek terminal baut terpasang dengan benar', display_order: 3, is_required: true }
    ];

    for (const item of checklistData) {
        await prisma.qc_checklist_items.create({ data: item }).catch(() => {});
        // catch: if duplicate found on re-run (no unique constraint), skip silently
    }

    // Level Inspections — 3 stages for this product
    await prisma.level_inspections.upsert({
        where: { id: IDS.levelInsp1 },
        update: {},
        create: {
            id: IDS.levelInsp1,
            product_id: IDS.product,
            qc_template_id: IDS.qcTemplate1,
            level: 'II',
            aql_critical: 0.0,
            aql_major: 1.0,
            aql_minor: 2.5,
            sample_size: 32,
            accept_critical: 0,
            accept_major: 1,
            accept_minor: 3,
            reject_critical: 1,
            reject_major: 2,
            reject_minor: 4,
            is_active: true
        }
    });

    await prisma.level_inspections.upsert({
        where: { id: IDS.levelInsp2 },
        update: {},
        create: {
            id: IDS.levelInsp2,
            product_id: IDS.product,
            qc_template_id: IDS.qcTemplate2,
            level: 'II',
            aql_critical: 0.0,
            aql_major: 1.0,
            aql_minor: 2.5,
            sample_size: 32,
            accept_critical: 0,
            accept_major: 1,
            accept_minor: 3,
            reject_critical: 1,
            reject_major: 2,
            reject_minor: 4,
            is_active: true
        }
    });

    await prisma.level_inspections.upsert({
        where: { id: IDS.levelInsp3 },
        update: {},
        create: {
            id: IDS.levelInsp3,
            product_id: IDS.product,
            qc_template_id: IDS.qcTemplate3,
            level: 'II',
            aql_critical: 0.0,
            aql_major: 0.65,
            aql_minor: 1.5,
            sample_size: 50,
            accept_critical: 0,
            accept_major: 0,
            accept_minor: 1,
            reject_critical: 1,
            reject_major: 1,
            reject_minor: 2,
            is_active: true
        }
    });

    // ── 4. Warehouse ──────────────────────────────────────────────────────────
    console.log('🏭 Creating warehouse...');
    await prisma.warehouses.upsert({
        where: { id: IDS.warehouse },
        update: {},
        create: {
            id: IDS.warehouse,
            code: 'WH-MAIN',
            name: 'Gudang Utama',
            location: 'Gedung A, Lantai 1',
            is_active: true
        }
    });

    // ── 5. Receiving ──────────────────────────────────────────────────────────
    console.log('📥 Creating receiving data...');
    await prisma.batches.upsert({
        where: { id: IDS.batch },
        update: {},
        create: {
            id: IDS.batch,
            code: 'BATCH-2026-001',
            supplier_id: IDS.supplier,
            description: 'Batch pengiriman Maret 2026',
            notes: 'Seed data batch'
        }
    });

    await prisma.purchase_orders.upsert({
        where: { id: IDS.purchaseOrder },
        update: {},
        create: {
            id: IDS.purchaseOrder,
            po_number: 'PO-2026-00001',
            order_date: new Date('2026-02-15'),
            notes: 'PO pengadaan meter listrik 3-phase',
            user_id: IDS.adminUser
        }
    });

    await prisma.receiving_headers.upsert({
        where: { id: IDS.receivingHeader },
        update: {},
        create: {
            id: IDS.receivingHeader,
            purchase_order_id: IDS.purchaseOrder,
            gr_number: 'GR-2026-00001',
            received_by: IDS.adminUser,
            received_date: new Date('2026-03-01'),
            batch_id: IDS.batch,
            location: 'Dok Penerimaan A',
            status: 'pending',
            notes: 'Penerimaan batch Maret 2026'
        }
    });

    await prisma.receiving_items.upsert({
        where: { id: IDS.receivingItem },
        update: {},
        create: {
            id: IDS.receivingItem,
            receiving_header_id: IDS.receivingHeader,
            product_id: IDS.product,
            is_serialized: true,
            quantity: 3,
            item_type: 'product',
            notes: '3 unit meter listrik 3-phase'
        }
    });

    // Serial stagings
    const serials = [
        { id: IDS.serial1, serial_number: 'SN-EM-001' },
        { id: IDS.serial2, serial_number: 'SN-EM-002' },
        { id: IDS.serial3, serial_number: 'SN-EM-003' }
    ];

    for (const s of serials) {
        await prisma.serial_stagings.upsert({
            where: { id: s.id },
            update: {},
            create: {
                id: s.id,
                receiving_item_id: IDS.receivingItem,
                serial_number: s.serial_number,
                scanned_by: IDS.adminUser,
                scanned_at: new Date('2026-03-01T08:00:00Z')
            }
        });
    }

    // ── 6. Tracking ───────────────────────────────────────────────────────────
    console.log('📊 Creating tracking records...');
    const trackings = [
        { id: IDS.tracking1, code_item: 'TRK-SN-EM-001', serial_number: 'SN-EM-001' },
        { id: IDS.tracking2, code_item: 'TRK-SN-EM-002', serial_number: 'SN-EM-002' },
        { id: IDS.tracking3, code_item: 'TRK-SN-EM-003', serial_number: 'SN-EM-003' }
    ];

    for (const t of trackings) {
        await prisma.tracking.upsert({
            where: { id: t.id },
            update: {},
            create: {
                id: t.id,
                code_item: t.code_item,
                is_serialize: true,
                serial_number: t.serial_number,
                product_id: IDS.product,
                batch_id: IDS.batch,
                tracking_type: 'receiving',
                status: 'created',
                original_quantity: 1,
                current_quantity: 1,
                receiving_item_id: IDS.receivingItem
            }
        });
    }

    // ── 7. Sample Inspections + QC Results ───────────────────────────────────
    console.log('✅ Creating sample inspections and QC results...');

    // SN-EM-001: Stage 1 PASS, Stage 2 in_progress
    await prisma.sample_inspections.upsert({
        where: { id: IDS.sampleInsp1a },
        update: {},
        create: {
            id: IDS.sampleInsp1a,
            qc_phase: 'receiving',
            receiving_item_id: IDS.receivingItem,
            level_inspection_id: IDS.levelInsp1,
            qc_template_id: IDS.qcTemplate1,
            inspection_level: 'II',
            aql_critical: 0.0,
            aql_major: 1.0,
            aql_minor: 2.5,
            sample_size: 32,
            accept_critical: 0,
            accept_major: 1,
            accept_minor: 3,
            reject_critical: 1,
            reject_major: 2,
            reject_minor: 4
        }
    });

    await prisma.qc_results.upsert({
        where: { id: IDS.qcResult1a },
        update: {},
        create: {
            id: IDS.qcResult1a,
            tracking_id: IDS.tracking1,
            inspector_by: IDS.inspectorUser,
            result: 'pass',
            sample_inspection_id: IDS.sampleInsp1a,
            qc_template_id: IDS.qcTemplate1,
            qc_place: 'Ruang QC Lantai 1',
            notes: 'Semua item fisik dalam kondisi baik',
            inspection_date: new Date('2026-03-02T09:00:00Z')
        }
    });

    // Update tracking status after QC
    await prisma.tracking.update({
        where: { id: IDS.tracking1 },
        data: { status: 'qc_passed' }
    });

    // Stage 2 — in_progress (sample_inspection ada, qc_result belum)
    await prisma.sample_inspections.upsert({
        where: { id: IDS.sampleInsp1b },
        update: {},
        create: {
            id: IDS.sampleInsp1b,
            qc_phase: 'receiving',
            receiving_item_id: IDS.receivingItem,
            level_inspection_id: IDS.levelInsp2,
            qc_template_id: IDS.qcTemplate2,
            inspection_level: 'II',
            aql_critical: 0.0,
            aql_major: 1.0,
            aql_minor: 2.5,
            sample_size: 32,
            accept_critical: 0,
            accept_major: 1,
            accept_minor: 3,
            reject_critical: 1,
            reject_major: 2,
            reject_minor: 4
        }
    });
    // (no qc_result for stage 2 → status = in_progress)

    // SN-EM-002: All stages pending (no sample_inspections at all)

    // SN-EM-003: All 3 stages done (pass, pass, fail)
    await prisma.sample_inspections.upsert({
        where: { id: IDS.sampleInsp3a },
        update: {},
        create: {
            id: IDS.sampleInsp3a,
            qc_phase: 'receiving',
            receiving_item_id: IDS.receivingItem,
            level_inspection_id: IDS.levelInsp1,
            qc_template_id: IDS.qcTemplate1,
            inspection_level: 'II',
            aql_critical: 0.0, aql_major: 1.0, aql_minor: 2.5,
            sample_size: 32, accept_critical: 0, accept_major: 1, accept_minor: 3,
            reject_critical: 1, reject_major: 2, reject_minor: 4
        }
    });

    await prisma.qc_results.upsert({
        where: { id: IDS.qcResult3a },
        update: {},
        create: {
            id: IDS.qcResult3a,
            tracking_id: IDS.tracking3,
            inspector_by: IDS.inspectorUser,
            result: 'pass',
            sample_inspection_id: IDS.sampleInsp3a,
            qc_template_id: IDS.qcTemplate1,
            qc_place: 'Ruang QC Lantai 1',
            inspection_date: new Date('2026-03-02T09:30:00Z')
        }
    });

    await prisma.sample_inspections.upsert({
        where: { id: IDS.sampleInsp3b },
        update: {},
        create: {
            id: IDS.sampleInsp3b,
            qc_phase: 'receiving',
            receiving_item_id: IDS.receivingItem,
            level_inspection_id: IDS.levelInsp2,
            qc_template_id: IDS.qcTemplate2,
            inspection_level: 'II',
            aql_critical: 0.0, aql_major: 1.0, aql_minor: 2.5,
            sample_size: 32, accept_critical: 0, accept_major: 1, accept_minor: 3,
            reject_critical: 1, reject_major: 2, reject_minor: 4
        }
    });

    await prisma.qc_results.upsert({
        where: { id: IDS.qcResult3b },
        update: {},
        create: {
            id: IDS.qcResult3b,
            tracking_id: IDS.tracking3,
            inspector_by: IDS.inspectorUser,
            result: 'pass',
            sample_inspection_id: IDS.sampleInsp3b,
            qc_template_id: IDS.qcTemplate2,
            qc_place: 'Ruang QC Lantai 1',
            inspection_date: new Date('2026-03-02T10:00:00Z')
        }
    });

    await prisma.sample_inspections.upsert({
        where: { id: IDS.sampleInsp3c },
        update: {},
        create: {
            id: IDS.sampleInsp3c,
            qc_phase: 'receiving',
            receiving_item_id: IDS.receivingItem,
            level_inspection_id: IDS.levelInsp3,
            qc_template_id: IDS.qcTemplate3,
            inspection_level: 'II',
            aql_critical: 0.0, aql_major: 0.65, aql_minor: 1.5,
            sample_size: 50, accept_critical: 0, accept_major: 0, accept_minor: 1,
            reject_critical: 1, reject_major: 1, reject_minor: 2
        }
    });

    await prisma.qc_results.upsert({
        where: { id: IDS.qcResult3c },
        update: {},
        create: {
            id: IDS.qcResult3c,
            tracking_id: IDS.tracking3,
            inspector_by: IDS.inspectorUser,
            result: 'fail',
            sample_inspection_id: IDS.sampleInsp3c,
            qc_template_id: IDS.qcTemplate3,
            qc_place: 'Ruang QC Lantai 1',
            notes: 'Ditemukan 2 unit dengan kabel terkelupas — melebihi batas reject',
            inspection_date: new Date('2026-03-02T11:00:00Z')
        }
    });

    await prisma.tracking.update({
        where: { id: IDS.tracking3 },
        data: { status: 'qc_failed' }
    });

    // ── Done ──────────────────────────────────────────────────────────────────
    console.log('\n✅ Seed selesai!\n');
    console.log('══════════════════════════════════════════════════');
    console.log('  Login credentials:');
    console.log('    Admin    → email: admin@energymeter.id      | pass: Password123!');
    console.log('    Inspector→ email: inspector@energymeter.id  | pass: Password123!');
    console.log('');
    console.log('  Product : Meter Listrik 3-Phase 10A (3 QC stages)');
    console.log('  Receiving item ID:', IDS.receivingItem);
    console.log('');
    console.log('  QC Progress test:');
    console.log('    GET /api/qc-results/progress?serial_number=SN-EM-001');
    console.log('    → Stage 1: pass | Stage 2: in_progress | Stage 3: pending');
    console.log('');
    console.log('    GET /api/qc-results/progress?serial_number=SN-EM-002');
    console.log('    → Stage 1: pending | Stage 2: pending | Stage 3: pending');
    console.log('');
    console.log('    GET /api/qc-results/progress?serial_number=SN-EM-003');
    console.log('    → Stage 1: pass | Stage 2: pass | Stage 3: fail');
    console.log('══════════════════════════════════════════════════\n');
}

main()
    .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
