const axios = require('axios');

async function createProduct() {
    const productData = {
        title: 'Test Laptop',
        description: 'A high-quality laptop for testing purposes.',
        price: '999.99',
        category: 'Electronics',
        images: ['https://via.placeholder.com/100'],
        seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
        location: {
            city: '680b56ebef65b11b78aa297c',
            country: '680b56ebef65b11b78aa2970',
        },
        condition: 'Like new',
    };

    try {
        const response = await axios.post('http://localhost:5000/api/products/create', productData);
        console.log('Product created successfully:', response.data);
    } catch (error) {
        console.error('Error creating product:', error.response ? error.response.data : error.message);
    }
}

createProduct();