const mongoose = require('mongoose');
const User = require('../models/User');

// ✅ Calculates compatibility score between two users
const calculateScore = (userA, userB) => {
  let score = 0;
  const answersA = userA.compatibilityAnswers;
  const answersB = userB.compatibilityAnswers;

  Object.keys(answersA).forEach((key) => {
    if (answersA[key] === answersB[key]) {
      score += 1;
    }
  });

  return score;
};

// ✅ Match user by ID
const matchUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Auto-unfreeze if freezeUntil has passed
    if (user.freezeUntil && new Date(user.freezeUntil) <= new Date()) {
      user.state = 'available';
      user.freezeUntil = null;
      await user.save();
    }

    // ❌ Skip matching if user is still frozen or unavailable
    if (
      user.state !== 'available' ||
      (user.freezeUntil && user.freezeUntil > new Date())
    ) {
      return res.status(400).json({ error: 'User not available for matching yet' });
    }

    // ✅ Find candidates (excluding self)
    const candidates = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(userId) }, // ✅ fix: convert string to ObjectId
      state: 'available',
      $or: [
        { freezeUntil: null },
        { freezeUntil: { $lte: new Date() } }
      ]
    });

    console.log('Candidates found:', candidates.length);

    let bestMatch = null;
    let highestScore = -1;

    candidates.forEach((candidate) => {
      const score = calculateScore(user, candidate);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = candidate;
      }
    });

    if (bestMatch) {
      // ✅ Update both users
      user.match = bestMatch._id;
      user.state = 'matched';

      bestMatch.match = user._id;
      bestMatch.state = 'matched';

      await user.save();
      await bestMatch.save();

      console.log('✅ Match created:', user._id, '<->', bestMatch._id);

      return res.status(200).json({ message: 'Match found!', match: bestMatch });
    } else {
      return res.status(200).json({ message: 'No match found. Try again later.' });
    }
  } catch (err) {
    console.error('❌ Error in matchUser:', err);
    return res.status(500).json({ error: 'Match process failed' });
  }
};

module.exports = { matchUser };
