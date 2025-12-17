const Chat = require('../models/Chat');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @route   GET /api/chat/conversations
// @desc    Get user's chat conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    let conversations;
    
    // Managers see all conversations
    if (req.user.is_manager || req.user.is_admin) {
      conversations = await Chat.find()
        .populate('user', 'name email profilePicture')
        .sort({ updatedAt: -1 });
    } else {
      // Regular users see only their conversations
      conversations = await Chat.find({ user: req.user._id })
        .sort({ updatedAt: -1 });
    }
    
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/chat/:id
// @desc    Get conversation messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id)
      .populate('user', 'name email profilePicture');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Authorization check
    if (!req.user.is_manager && !req.user.is_admin && conversation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({ conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/chat/send
// @desc    Send message (customer to support)
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message, subject } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Find or create conversation
    let conversation = await Chat.findOne({
      user: req.user._id,
      status: 'open'
    });
    
    if (!conversation) {
      conversation = await Chat.create({
        user: req.user._id,
        subject: subject || 'Support Request',
        messages: []
      });
    }
    
    // Add message
    conversation.messages.push({
      sender_type: 'customer',
      sender: req.user._id,
      message
    });
    
    conversation.updatedAt = new Date();
    await conversation.save();
    
    await conversation.populate('user', 'name email profilePicture');
    
    // Notify all managers via Socket.io
    if (global.io) {
      global.io.emit('manager_new_message', {
        conversationId: conversation._id,
        user: {
          id: req.user._id,
          name: req.user.name,
          profilePicture: req.user.profilePicture
        },
        message,
        timestamp: new Date()
      });
    }
    
    // Send email notification to managers
    const User = require('../models/User');
    const managers = await User.find({ $or: [{ is_manager: true }, { is_admin: true }] });
    for (const manager of managers) {
      const template = emailTemplates.supportMessageReceived(
        req.user.name,
        req.user.email,
        subject || 'Support Request',
        message
      );
      await sendEmail({
        to: manager.email,
        subject: template.subject,
        html: template.html
      });
    }
    
    res.json({
      message: 'Message sent successfully',
      conversation
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/chat/:id/reply
// @desc    Reply to customer message (manager/admin only)
// @access  Private (Manager/Admin only)
exports.replyMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const conversation = await Chat.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Add reply
    conversation.messages.push({
      sender_type: 'support',
      sender: req.user._id,
      message
    });
    
    conversation.updatedAt = new Date();
    await conversation.save();
    
    // Notify customer via Socket.io
    if (global.io) {
      global.io.emit(`customer_${conversation.user._id}_message`, {
        conversationId: conversation._id,
        message,
        timestamp: new Date()
      });
    }
    
    // Send email to customer
    await sendEmail({
      to: conversation.user.email,
      subject: `Re: ${conversation.subject}`,
      html: `
        <h2>Support Response</h2>
        <p>Dear ${conversation.user.name},</p>
        <p>We have replied to your support request:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 3px solid #007bff; margin: 20px 0;">
          ${message}
        </div>
        <p>You can continue the conversation in the app.</p>
        <p>Best regards,<br>Support Team</p>
      `
    });
    
    res.json({
      message: 'Reply sent successfully',
      conversation
    });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/chat/:id/close
// @desc    Close conversation (manager/admin only)
// @access  Private (Manager/Admin only)
exports.closeConversation = async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    conversation.status = 'closed';
    await conversation.save();
    
    res.json({ message: 'Conversation closed' });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
