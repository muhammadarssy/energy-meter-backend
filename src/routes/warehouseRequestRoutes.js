const express = require('express');
const controller = require('../controllers/warehouseRequestController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id/approve', controller.approve);
router.patch('/:id/reject', controller.reject);

module.exports = router;
