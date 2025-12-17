const express = require('express');
const router = express.Router();
const { auth, requireManager } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  replyMessage,
  closeConversation
} = require('../controllers/chatController');

// Get conversations
router.get('/conversations', auth, getConversations);

// Get conversation messages
router.get('/:id', auth, getMessages);

// Send message
router.post('/send', auth, sendMessage);

// Reply to message (manager/admin only)
router.post('/:id/reply', auth, requireManager, replyMessage);

// Close conversation (manager/admin only)
router.post('/:id/close', auth, requireManager, closeConversation);

module.exports = router;
