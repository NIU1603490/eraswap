const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes.js');
const locationRoutes = require('./routes/locationRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const followRoutes = require('./routes/followRoutes.js');
const imageRoutes = require('./routes/imageRoutes.js');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes locations
app.use('/api/locations', locationRoutes); // Location routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/products', productRoutes); // Product routes
app.use('/api/transactions', transactionRoutes); // Transaction routes
app.use('/api/follows', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);



// root route
app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

module.exports = app; // Export the app for use in server.js