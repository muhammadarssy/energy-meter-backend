const express = require('express');
const ctrl = require('../controllers/productController');
const { uploadMemory } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// ─── Import / Export ────────────────────────────────────────────────────────
router.get('/export', ctrl.exportProducts);
router.get('/template', ctrl.downloadTemplate);
router.post('/import', uploadMemory.single('file'), ctrl.importProducts);

// ─── Products CRUD ────────────────────────────────────────────────────────────
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.softDelete);

// ─── Level Inspections (nested) ───────────────────────────────────────────────
router.get('/:id/level-inspections', ctrl.getLevelInspections);
router.post('/:id/level-inspections', ctrl.addLevelInspection);
router.delete('/:id/level-inspections/:liId', ctrl.deleteLevelInspection);

module.exports = router;
