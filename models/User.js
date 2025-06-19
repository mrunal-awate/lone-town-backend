const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  compatibilityAnswers: Object,

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  state: {
    type: String,
    enum: ['available', 'matched', 'pinned', 'frozen'],
    default: 'available'
  },

  pinStatus: {
    type: String,
    enum: ['pinned', 'unpinned'],
    default: 'pinned'
  },

  freezeUntil: {
    type: Date,
    default: null
  },

  messageCount: {
    type: Number,
    default: 0
  },

  lastMessageAt: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
