const express = require('express');
const controller = require('../controllers/qcTemplateController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

// Checklist items
router.get('/:id/checklist-items', controller.getChecklistItems);
router.post('/:id/checklist-items', controller.addChecklistItem);
router.patch('/:id/checklist-items/:itemId', controller.updateChecklistItem);
router.delete('/:id/checklist-items/:itemId', controller.removeChecklistItem);

// Level Inspection (1:1 per template)
router.get('/:id/level-inspection', controller.getLevelInspection);
router.put('/:id/level-inspection', controller.saveLevelInspection);
router.delete('/:id/level-inspection', controller.removeLevelInspection);

module.exports = router;
