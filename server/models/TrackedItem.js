const mongoose = require('mongoose');

const TrackedItemSchema = new mongoose.Schema({
  email: String,
  url: String,
  targetPrice: Number,
  currentPrice: Number,
  notified: { type: Boolean, default: false }
});

module.exports = mongoose.model('TrackedItem', TrackedItemSchema);
