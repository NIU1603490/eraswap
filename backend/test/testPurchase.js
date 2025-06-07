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

testPurchaseCreation();