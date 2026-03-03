const express = require('express');
const controller = require('../controllers/trackingController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/from-receiving-item/:itemId', controller.createFromReceivingItem);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
