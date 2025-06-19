const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);

// ✅ Update socket.io CORS to allow Vercel frontend
const io = require('socket.io')(http, {
  cors: {
    origin: [
      'https://lone-town-frontend.vercel.app', // ✅ your deployed frontend
      'http://localhost:3000' // ✅ allow local dev too
    ],
    methods: ['GET', 'POST']
  }
});

// Models
const Message = require('./models/Message');

// Middleware
app.use(cors({
  origin: [
    'https://lone-town-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ✅ WebSocket logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('joinRoom', (matchId) => {
    socket.join(matchId);
    console.log(`User joined room: ${matchId}`);
  });

  socket.on('sendMessage', async ({ matchId, sender, text }) => {
    try {
      const msg = new Message({ matchId, sender, text });
      await msg.save();

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

// ✅ Start server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
