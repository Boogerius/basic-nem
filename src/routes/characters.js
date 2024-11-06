import express from 'express';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';  // if needed for protected routes

export const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const characters = await User.find()
      .select('characterName bio lastMessageAt')
      .sort('-lastMessageAt');
    res.json(characters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById( req.params.id )
    const characterInfo = {
      'characterName': user.characterName,
      'bio': user.bio
    }
    res.json(characterInfo)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ author: req.params.id })
      .sort('createdAt')
      .populate('author', 'characterName');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});