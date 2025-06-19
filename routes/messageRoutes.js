const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/messages/:matchId
router.get('/:matchId', async (req, res) => {
  try {
    const messages = await Message.find({ matchId: req.params.matchId }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/unlock/:matchId
router.get('/unlock/:matchId', async (req, res) => {
  try {
    const matchId = req.params.matchId;

    // 48 hours ago
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const messages = await Message.find({
      matchId,
      timestamp: { $gte: cutoff }
    });

    if (messages.length >= 3) {
      return res.json({ eligible: true });
    } else {
      return res.json({ eligible: false, count: messages.length });
    }
  } catch (err) {
    console.error('Error checking unlock:', err);
    res.status(500).json({ error: 'Failed to check unlock' });
  }
});


module.exports = router;
