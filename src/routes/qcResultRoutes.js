const express = require('express');
const controller = require('../controllers/qcResultController');

const router = express.Router();

// Sample Inspections
router.get('/sample-inspections', controller.getAllSampleInspections);
router.get('/sample-inspections/:id', controller.getSampleInspectionById);
router.post('/sample-inspections', controller.createSampleInspection);

// QC Progress
router.get('/progress', controller.getQcProgress);

// QC Results
router.get('/', controller.getAllQcResults);
router.get('/:id', controller.getQcResultById);
router.post('/', controller.createQcResult);

// Defects under a QC result
router.post('/:resultId/defects', controller.addDefect);
router.patch('/:resultId/defects/:defectId', controller.updateDefect);
router.delete('/:resultId/defects/:defectId', controller.deleteDefect);

module.exports = router;
