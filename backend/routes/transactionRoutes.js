const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');


//api/transactions/create
router.post('/create', transactionController.createTransaction);
//api/transactions/:transactionId
router.get('/:transactionId', transactionController.getTransactionById);
//api/transactions/user/:userId
//api/transactions/user/user_2x9QwmBO80xgY0gwvDXqTyZCaFQ
router.get('/buyer/:userId', transactionController.getTransactionsByBuyerId);
router.get('/seller/:userId', transactionController.getTransactionsBySellerId);

///api/transactions/update/:transactionId
router.put('/update/:transactionId', transactionController.updateTransaction);


module.exports = router;

