import express from 'express';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';

export const router = express.Router();

router.post('/', requireAuth, requireVerified, async (req, res) => {
  try {
    const message = new Message({
      content: req.body.content,
      author: req.session.userId
    });
    
    await message.save();
    
    // Update user's lastMessageAt
    await User.findByIdAndUpdate(req.session.userId, {
      lastMessageAt: new Date()
    });
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});