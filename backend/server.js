
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const app = require('./app.js');

dotenv.config(); // Load environment variables from .env file
console.log('MONGODB_URI en index.js:', process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});