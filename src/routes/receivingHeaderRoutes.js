const express = require('express');
const controller = require('../controllers/receivingHeaderController');
const receivingItemRoutes = require('./receivingItemRoutes');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.patch('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

// Nested: items under a header
router.use('/:headerId/items', receivingItemRoutes);

module.exports = router;
