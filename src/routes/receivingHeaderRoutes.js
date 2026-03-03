const express = require('express');
const controller = require('../controllers/receivingHeaderController');
const receivingItemRoutes = require('./receivingItemRoutes');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

// Nested: items under a header
router.use('/:headerId/items', receivingItemRoutes);

module.exports = router;
