
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const app = require('./app.js');
const cloudinary = require('./config/cloudinaryConfig');

dotenv.config(); // Load environment variables from .env file
console.log('MONGODB_URI en server.js:', process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
async function checkCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection:', result.status);
  } catch (err) {
    console.error('Cloudinary connection failed:', err.message);
  }
}

checkCloudinaryConnection();


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});