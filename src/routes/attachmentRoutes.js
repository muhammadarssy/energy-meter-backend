const express = require('express');
const controller = require('../controllers/attachmentController');

const router = express.Router();

router.post('/upload', controller.uploadFiles);
router.get('/', controller.getAll);
router.get('/entity/:entityType/:entityId', controller.getByEntity);
router.get('/:id', controller.getById);
router.delete('/:id', controller.remove);

module.exports = router;
