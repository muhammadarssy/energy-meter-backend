const express = require('express');
const ctrl = require('../controllers/plnCodeController');

const router = express.Router();

// ─── Queries ──────────────────────────────────────────────────────────────────
router.get('/', ctrl.getAll);
router.get('/unlasered', ctrl.getUnlasered);
router.get('/unprinted', ctrl.getUnprinted);
router.get('/by-code/:code', ctrl.getByFullCode);
router.get('/:id', ctrl.getById);

// ─── Generation ───────────────────────────────────────────────────────────────
router.post('/generate/partial', ctrl.generatePartial);
router.post('/generate/partial/bulk', ctrl.bulkGeneratePartial);
router.post('/generate/complete', ctrl.generateComplete);
router.post('/generate/complete/bulk', ctrl.bulkGenerateComplete);
router.patch('/:id/material', ctrl.addMaterialInfo);

// ─── Laser / Print ────────────────────────────────────────────────────────────
router.patch('/:id/laser', ctrl.markAsLasered);
router.patch('/laser/bulk', ctrl.bulkMarkAsLasered);
router.patch('/:id/print', ctrl.markAsPrinted);
router.patch('/print/bulk', ctrl.bulkMarkAsPrinted);

// ─── Validate ─────────────────────────────────────────────────────────────────
router.post('/validate', ctrl.validateCode);

// ─── Box Management ───────────────────────────────────────────────────────────
router.get('/boxes', ctrl.getBoxes);
router.get('/boxes/:id', ctrl.getBoxById);
router.post('/boxes', ctrl.createBox);
router.patch('/boxes/assign', ctrl.assignToBox);
router.patch('/boxes/:id/seal', ctrl.sealBox);

module.exports = router;
