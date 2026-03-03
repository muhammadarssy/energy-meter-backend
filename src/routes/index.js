const express = require('express');

// ── Auth ──────────────────────────────────────────────────────────────────────
const authRoutes = require('./authRoutes');

// ── QC Master Data ────────────────────────────────────────────────────────────
const defectTypeRoutes = require('./defectTypeRoutes');
const qcTemplateRoutes = require('./qcTemplateRoutes');
const levelInspectionRoutes = require('./levelInspectionRoutes');

// ── Flow 1: Receiving ─────────────────────────────────────────────────────────
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const batchRoutes = require('./batchRoutes');
const receivingHeaderRoutes = require('./receivingHeaderRoutes');
const receivingItemStandaloneRoutes = require('./receivingItemStandaloneRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const trackingRoutes = require('./trackingRoutes');
const qcResultRoutes = require('./qcResultRoutes');
const productionStopRoutes = require('./productionStopRoutes');
const warehouseRequestRoutes = require('./warehouseRequestRoutes');

// ── Flow 2: Assembly ──────────────────────────────────────────────────────────
const assemblyRoutes = require('./assemblyRoutes');

// ── PLN Code ──────────────────────────────────────────────────────────────────
const plnCodeRoutes = require('./plnCodeRoutes');
const plnMasterRoutes = require('./plnMasterRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Energy Meter API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Auth / Users / Roles / Permissions
router.use('/auth', authRoutes);

// QC Master Data
router.use('/defect-types', defectTypeRoutes);
router.use('/qc-templates', qcTemplateRoutes);
router.use('/level-inspections', levelInspectionRoutes);

// Flow 1: Receiving
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/batches', batchRoutes);
router.use('/receiving-headers', receivingHeaderRoutes);
router.use('/receiving-items', receivingItemStandaloneRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/tracking', trackingRoutes);
router.use('/qc-results', qcResultRoutes);
router.use('/production-stops', productionStopRoutes);
router.use('/warehouse-requests', warehouseRequestRoutes);

// Flow 2: Assembly
router.use('/assembly-orders', assemblyRoutes);

// PLN Code (master data + code generation)
router.use('/pln-master', plnMasterRoutes);
router.use('/pln-codes', plnCodeRoutes);

module.exports = router;
