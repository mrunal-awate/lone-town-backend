const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🧠 Import matchUser from the controller
const { matchUser } = require('../controllers/matchController');

// ✅ Route 1: Register user
router.post('/register', async (req, res) => {
  try {
    const newUser = new User({
      compatibilityAnswers: req.body
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ✅ Route 2: Match user by ID
router.get('/match/:id', matchUser);

// ✅ Route 3: Unpin user
router.post('/unpin/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate('match');
    if (!user || !user.match) {
      return res.status(400).json({ error: 'User or match not found' });
    }

    const now = new Date();

    // Update the user who unpinned (reflection freeze)
    user.state = 'frozen';
    user.freezeUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hrs
    user.pinStatus = 'unpinned';

    // Update the matched partner
    const other = await User.findById(user.match._id);
    other.state = 'available';
    other.match = null;
    other.pinStatus = 'pinned';
    other.freezeUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hrs

    await user.save();
    await other.save();

    res.status(200).json({
      message: 'Unpinned successfully. You are now frozen for reflection.',
      userFreezeUntil: user.freezeUntil,
      otherAvailableAt: other.freezeUntil
    });
  } catch (err) {
    console.error('❌ Error during unpin:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ✅ Route 4: Get user by ID (for freezeUntil, onboarding answers)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

module.exports = router;
