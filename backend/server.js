
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const app = require('./app.js');
const { checkCloudinaryConnection } = require('./config/cloudinaryConfig');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config(); // Load environment variables from .env file
console.log('MONGODB_URI en server.js:', process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
global.io = new Server(server, {
  cors: {
    origin: '*',
  }
});

global.io.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});



// connect to MongoDB
connectDB();
//verify Cloudinary
checkCloudinaryConnection();


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});