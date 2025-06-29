const Transaction = require('../models/transaction');
const User = require('../models/user');
const Product = require('../models/product');
const { isValidObjectId } = require('mongoose');

const createTransaction = async (req, res) => {
  console.log('createTransaction called');
  console.log('req.body:', req.body);
  try {
    const {
      buyer,
      product,
      seller,
      price,
      status,
      paymentMethod,
      deliveryMethod,
      meetingDate,
      meetingTime,
      meetingLocation,
      messageToSeller,
    } = req.body;

    // validar camps requerits
    if (!buyer || !product || !seller) {
      return res.status(400).json({ success: false, message: 'Buyer, product, and seller are required' });
    }

    // validar ObjectIds
    if (!isValidObjectId(product)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // trobar usuaris i productes
    const userBuyer = await User.findOne({ clerkUserId: buyer });
    console.log('userBuyer:', userBuyer);
    const userSeller = await User.findOne({ clerkUserId: seller });
    console.log('userSeller:', userSeller);
    const productRecord = await Product.findById(product)
    .populate('title', 'images');
    console.log('product:', productRecord);

    if (!userBuyer || !userSeller || !productRecord) {
      return res.status(400).json({ success: false, message: 'User or product not found' });
    }

    // crear la transacció
    const transaction = await Transaction.create({
      buyer: userBuyer._id,
      product: productRecord._id,
      seller: userSeller._id,
      price,
      status,
      paymentMethod,
      deliveryMethod,
      meetingDate,
      meetingTime,
      meetingLocation,
      messageToSeller,
    });

    await Product.findByIdAndUpdate(productRecord._id, { status: 'Reserved' });

    if (!transaction) {
      return res.status(400).json({ success: false, message: 'Transaction not created' });
    }

    console.log('Transaction created:', transaction);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(id)
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .populate('product', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


//get all transactions of a buyer
const getTransactionsByBuyerId = async (req, res) => {
    console.log('getTransactionsByBuyerId called');
    const { userId  } = req.params;
    try {
      const user = await User.findOne({ clerkUserId: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const transactions = await Transaction.find({ buyer: user._id })
      .populate('buyer', 'username',)
      .populate('seller', 'username',)
      .populate('product', 'title images',)
      .sort({createdAt: -1});

      console.log('transactions:', transactions);
      res.status(200).json({ success: true, data: transactions });

    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getTransactionsBySellerId = async (req, res) => {
  console.log('getTransactionsBySellerId called');
    const { userId  } = req.params;
    try {
      const user = await User.findOne({ clerkUserId: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const transactions = await Transaction.find({ seller: user._id })
      .populate('buyer', 'username',)
      .populate('seller', 'username',)
      .populate('product', 'title images',)
      .sort({createdAt: -1});

      console.log('transactions:', transactions);
      res.status(200).json({ success: true, data: transactions });

    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

//transactions/update/:transactionId
const updateTransaction = async (req, res) => {
  console.log(' updateTransaction called');
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if(!transactionId) { 
      res.status(400).json({
      success: false,
      message: 'Transaction ID required'
    });
  }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {status}, //update status
      { new: true, runValidators: true}
    );

    if(!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    //actualitzar estat del producte segons l'estat de la transacció
    const productId = updatedTransaction.product._id;
    console.log(productId);
    if (productId) {
      let newProductStatus;
      if (status === 'Completed') {
        newProductStatus = 'Sold';
      } else if (status === 'Canceled') {
        newProductStatus = 'Available';
      }  else if (status === 'Confirmed') {
        newProductStatus = 'Reserved';
      } 

      if (newProductStatus) {
        await Product.findByIdAndUpdate(
          productId,
          { status: newProductStatus },
          { new: true, runValidators: true }
        );
      }
    }

    console.log('Transaction updated:', updatedTransaction);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully'
    });
    
  } catch (error) {
    console.error('Update Transaction error:', error);
    res.status(500).json({ message: error.message });
    
  }

}


module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionsByBuyerId,
  getTransactionsBySellerId,
  updateTransaction,
};