const express = require('express');
const ctrl = require('../controllers/plnMasterController');

const router = express.Router();

// ─── Material Groups ──────────────────────────────────────────────────────────
router.get('/material-groups', ctrl.getAllMaterialGroups);
router.get('/material-groups/:id', ctrl.getMaterialGroupById);
router.post('/material-groups', ctrl.createMaterialGroup);
router.patch('/material-groups/:id', ctrl.updateMaterialGroup);
router.delete('/material-groups/:id', ctrl.deleteMaterialGroup);

// ─── Material Sub Groups ──────────────────────────────────────────────────────
router.get('/material-sub-groups', ctrl.getAllMaterialSubGroups);
router.get('/material-sub-groups/:id', ctrl.getMaterialSubGroupById);
router.post('/material-sub-groups', ctrl.createMaterialSubGroup);
router.patch('/material-sub-groups/:id', ctrl.updateMaterialSubGroup);
router.delete('/material-sub-groups/:id', ctrl.deleteMaterialSubGroup);

// ─── Variants ─────────────────────────────────────────────────────────────────
router.get('/variants', ctrl.getAllVariants);
router.get('/variants/:id', ctrl.getVariantById);
router.post('/variants', ctrl.createVariant);
router.patch('/variants/:id', ctrl.updateVariant);
router.delete('/variants/:id', ctrl.deleteVariant);

// ─── Factories ────────────────────────────────────────────────────────────────
router.get('/factories', ctrl.getAllFactories);
router.get('/factories/:id', ctrl.getFactoryById);
router.post('/factories', ctrl.createFactory);
router.patch('/factories/:id', ctrl.updateFactory);
router.delete('/factories/:id', ctrl.deleteFactory);

module.exports = router;
