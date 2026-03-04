const express = require('express');
const ctrl = require('../controllers/productController');

const router = express.Router();

// ─── Products CRUD ────────────────────────────────────────────────────────────
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.softDelete);

// ─── Level Inspections (nested) ───────────────────────────────────────────────
router.get('/:id/level-inspections', ctrl.getLevelInspections);
router.post('/:id/level-inspections', ctrl.addLevelInspection);
router.patch('/:id/level-inspections/:liId', ctrl.updateLevelInspection);
router.delete('/:id/level-inspections/:liId', ctrl.deleteLevelInspection);

module.exports = router;
