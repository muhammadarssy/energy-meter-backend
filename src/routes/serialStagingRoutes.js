const express = require('express');
const controller = require('../controllers/serialStagingController');

const router = express.Router({ mergeParams: true });

router.get('/', controller.getByItem);
router.get('/status', controller.getStatus);
router.post('/scan', controller.scan);
router.post('/scan-bulk', controller.scanBulk);
router.delete('/:serialId', controller.remove);

module.exports = router;
