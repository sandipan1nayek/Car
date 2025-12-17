const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    sender_type: {
      type: String,
      enum: ['customer', 'manager'],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  last_message_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ customer: 1 });
chatSchema.index({ status: 1, last_message_at: -1 });

module.exports = mongoose.model('Chat', chatSchema);
