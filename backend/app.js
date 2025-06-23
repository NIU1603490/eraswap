const express = require('express');
const cors = require('cors');
const { clerkMiddleware, getAuth, requireAuth } = require('@clerk/express');
const userRoutes = require('./routes/userRoutes.js');
const locationRoutes = require('./routes/locationRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const followRoutes = require('./routes/followRoutes.js');
const imageRoutes = require('./routes/imageRoutes.js');
const conversationRoutes = require('./routes/conversationRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

app.use(clerkMiddleware());

// Routes 
app.use('/api/locations', locationRoutes); // Location routes
app.use('/api/users', requireAuth(), userRoutes); // User routes
app.use('/api/products', requireAuth(), productRoutes); // Product routes
app.use('/api/transactions', requireAuth(), transactionRoutes); // Transaction routes
app.use('/api/follows', requireAuth(), followRoutes);
app.use('/api/posts', requireAuth(), postRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/conversations', requireAuth(), conversationRoutes);
app.use('/api/messages', requireAuth(), messageRoutes);
app.use('/api/ai', aiRoutes);

// app.use('/api/locations', locationRoutes); // Location routes
// app.use('/api/users', userRoutes); // User routes
// app.use('/api/products', productRoutes); // Product routes
// app.use('/api/transactions', transactionRoutes); // Transaction routes
// app.use('/api/follows', followRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/images', imageRoutes);
// app.use('/api/conversations', conversationRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/ai', aiRoutes);



// root route
app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

app.get('/validate-token', requireAuth(), (req, res) => {
  const auth = getAuth(req);
  res.json({ auth });
});

module.exports = app; // Export the app for use in server.js