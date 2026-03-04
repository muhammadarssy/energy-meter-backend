const express = require('express');
const ctrl = require('../controllers/productMasterController');

const router = express.Router();

// ─── Suppliers ────────────────────────────────────────────────────────────────
router.get('/suppliers', ctrl.getAllSuppliers);
router.get('/suppliers/:id', ctrl.getSupplierById);
router.post('/suppliers', ctrl.createSupplier);
router.patch('/suppliers/:id', ctrl.updateSupplier);
router.delete('/suppliers/:id', ctrl.deleteSupplier);

// ─── Product Types ────────────────────────────────────────────────────────────
router.get('/product-types', ctrl.getAllProductTypes);
router.get('/product-types/:id', ctrl.getProductTypeById);
router.post('/product-types', ctrl.createProductType);
router.patch('/product-types/:id', ctrl.updateProductType);
router.delete('/product-types/:id', ctrl.deleteProductType);

// ─── Product Categories ───────────────────────────────────────────────────────
router.get('/product-categories', ctrl.getAllProductCategories);
router.get('/product-categories/:id', ctrl.getProductCategoryById);
router.post('/product-categories', ctrl.createProductCategory);
router.patch('/product-categories/:id', ctrl.updateProductCategory);
router.delete('/product-categories/:id', ctrl.deleteProductCategory);

module.exports = router;
