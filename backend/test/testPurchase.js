const axios = require('axios');

async function testPurchaseCreation() {
  const samplePurchase = {
    buyer: 'user_2x9QwmBO80xgY0gwvDXqTyZCaFQ', // Replace with a valid Clerk user ID
    product: '68248f42415d977f7240a8d4', // Replace with a valid Product _id
    seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W', // Replace with a valid Clerk user ID for the seller
    price: { amount: 100, currency: 'NOK' },
    status: 'pending',
    paymentMethod: 'cash',
    deliveryMethod: 'inPerson',
    meetingDate: new Date().toISOString(),
    meetingTime: new Date().toLocaleTimeString(),
    meetingLocation: 'Campus Library',
    messageToSeller: 'Looking forward to meeting!',
  };

  try {
    const response = await axios.post('http://localhost:5000/api/transactions/create', samplePurchase);
    console.log('Purchase creation response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

async function transactionFetchTests() {
  const buyerId = 'CLERK_BUYER_ID';
  const sellerId = 'CLERK_SELLER_ID';
  const transactionId = 'TRANSACTION_ID';
  try {
    const byId = await axios.get(`http://localhost:5000/api/transactions/${transactionId}`);
    console.log('Transaction by ID:', byId.data);

    const buyerTx = await axios.get(`http://localhost:5000/api/transactions/buyer/${buyerId}`);
    console.log('Transactions for buyer:', buyerTx.data);

    const sellerTx = await axios.get(`http://localhost:5000/api/transactions/seller/${sellerId}`);
    console.log('Transactions for seller:', sellerTx.data);

    const updateRes = await axios.put(`http://localhost:5000/api/transactions/update/${transactionId}`, {
      status: 'Completed',
    });
    console.log('Update transaction:', updateRes.data);
  } catch (error) {
    console.error('Transaction fetch test error:', error.response ? error.response.data : error.message);
  }
}

transactionFetchTests();
testPurchaseCreation();