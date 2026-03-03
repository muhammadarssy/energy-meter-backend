const express = require('express');
const controller = require('../controllers/levelInspectionController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/product/:productId/active', controller.getActiveByProduct);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

// Defect type links
router.post('/:id/defect-types', controller.addDefectType);
router.delete('/:id/defect-types/:defectTypeId', controller.removeDefectType);

module.exports = router;
