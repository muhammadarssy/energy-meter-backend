const express = require('express');
const controller = require('../controllers/assemblyController');

const router = express.Router();

// PLN Orders
router.get('/pln-orders', controller.getAllPlnOrders);
router.get('/pln-orders/:id', controller.getPlnOrderById);
router.post('/pln-orders', controller.createPlnOrder);
router.patch('/pln-orders/:id', controller.updatePlnOrder);

// Assembly Orders
router.get('/', controller.getAllAssemblyOrders);
router.get('/:id', controller.getAssemblyOrderById);
router.post('/', controller.createAssemblyOrder);
router.patch('/:id', controller.updateAssemblyOrder);
router.delete('/:id', controller.deleteAssemblyOrder);

// Items under an order
router.get('/:orderId/items', controller.getItemsByOrder);
router.post('/:orderId/items', controller.addItem);
router.post('/:orderId/items/bulk', controller.addItemsBulk);
router.patch('/:orderId/items/:itemId', controller.updateItem);
router.delete('/:orderId/items/:itemId', controller.deleteItem);

// Component confirmations (warehouse step)
router.get('/:orderId/confirmations', controller.getConfirmations);
router.post('/:orderId/confirmations/confirm-item', controller.confirmItem);
router.patch('/:orderId/start', controller.startOrder);

// Assembly process (create tracking + consume stock)
router.post('/:orderId/process', controller.processAssembly);
router.patch('/:orderId/complete', controller.completeOrder);

module.exports = router;
