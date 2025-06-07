const axios = require('axios');

async function createProduct(productData) {
    try {
        const response = await axios.post('http://localhost:5000/api/products/create', productData);
        console.log(`Product "${productData.title}" created successfully:`, response.data);
    } catch (error) {
        console.error(`Error creating product "${productData.title}":`, error.response ? error.response.data : error.message);
    }
}

async function createMultipleProducts() {
    const products = [
        {
            title: 'Gaming Laptop',
            description: 'A high-performance gaming laptop with RTX 3060 and 16GB RAM.',
            price: { amount: 1299.99, currency: 'EUR' },
            category: 'Electronics',
            images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a0a6?q=80&w=1000&auto=format&fit=crop'],
            seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            location: {
                city: '680b56ebef65b11b78aa297c',
                country: '680b56ebef65b11b78aa2970',
            },
            condition: 'Like new',
        },
        {
            title: 'Vintage Coffee Table',
            description: 'A beautifully restored vintage coffee table made of oak.',
            price: '199.50',
            category: 'Furniture',
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'],
            seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            location: {
                city: '680b56ebef65b11b78aa297c',
                country: '680b56ebef65b11b78aa2970',
            },
            condition: 'Used',
        },
        {
            title: 'Bluetooth Speaker',
            description: 'Portable Bluetooth speaker with excellent sound quality.',
            price: '49.99',
            category: 'Electronics',
            images: ['https://images.unsplash.com/photo-1608043152252-46e2df0d1cc8?q=80&w=1000&auto=format&fit=crop'],
            seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            location: {
                city: '680b56ebef65b11b78aa297c',
                country: '680b56ebef65b11b78aa2970',
            },
            condition: 'New',
        },
        {
            title: 'Leather Jacket',
            description: 'Black leather jacket, size M, barely worn.',
            price: '89.00',
            category: 'Clothing',
            images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c0a5a?q=80&w=1000&auto=format&fit=crop'],
            seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            location: {
                city: '680b56ebef65b11b78aa297c',
                country: '680b56ebef65b11b78aa2970',
            },
            condition: 'Like new',
        },
        {
            title: 'Set of Cooking Pots',
            description: 'A set of 3 stainless steel cooking pots, perfect for any kitchen.',
            price: '75.00',
            category: 'Kitchen',
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'],
            seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            location: {
                city: '680b56ebef65b11b78aa297c',
                country: '680b56ebef65b11b78aa2970',
            },
            condition: 'Used',
        },
    ];

    for (const product of products) {
        await createProduct(product);
    }
}

createMultipleProducts();