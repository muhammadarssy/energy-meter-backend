const express = require('express');
const controller = require('../controllers/receivingItemController');
const serialStagingRoutes = require('./serialStagingRoutes');

const router = express.Router();

router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

// Nested serial stagings under a receiving item
router.use('/:itemId/serials', serialStagingRoutes);

module.exports = router;
