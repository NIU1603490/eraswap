const express = require('express');
const router = express.Router();
const productController = require('../controller/productController.js');

//api/products
router.get('/:clerkUserId', productController.getProducts);
router.post('/create', productController.createProduct);
router.get('/my/:clerkUserId',productController.getProductByClerkId);
router.get('/id/:productId', productController.getProductById);
router.delete('/delete/:productId', productController.deleteProduct); //api/product/delete
router.put('/update/:productId', productController.updateProduct); //api/product/update


module.exports = router;