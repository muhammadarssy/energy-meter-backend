const express = require('express');
const controller = require('../controllers/qcResultController');

const router = express.Router();

router.get('/', controller.getAllProductionStops);
router.patch('/:id/resolve', controller.resolveProductionStop);

module.exports = router;
