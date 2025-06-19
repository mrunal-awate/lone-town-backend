const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // frontend origin
    methods: ['GET', 'POST']
  }
});

// Models
const Message = require('./models/Message');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

// Routes
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// WebSocket setup
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  // Join a chat room using matchId
  socket.on('joinRoom', (matchId) => {
    socket.join(matchId);
    console.log(`User joined room: ${matchId}`);
  });

  // Handle incoming message and store it
  socket.on('sendMessage', async ({ matchId, sender, text }) => {
    try {
      const msg = new Message({
        matchId,
        sender,
        text
      });

      await msg.save(); // Store in MongoDB

      io.to(matchId).emit('receiveMessage', {
        sender,
        text,
        timestamp: msg.timestamp
      });
    } catch (err) {
      console.error('❌ Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
