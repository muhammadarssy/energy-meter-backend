const express = require('express');
const controller = require('../controllers/receivingItemController');

// This router is mounted at both:
//   /api/receiving-headers/:headerId/items  (nested)
//   /api/receiving-items                    (standalone for single item ops)
const router = express.Router({ mergeParams: true });

// Nested under header
router.get('/', controller.getByHeader);
router.post('/', controller.create);
router.post('/bulk', controller.createBulk);

module.exports = router;
