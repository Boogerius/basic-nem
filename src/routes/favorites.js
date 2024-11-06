import express from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

export const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate('favorites', 'characterName bio lastMessageAt');
    res.json(user.favorites);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user.favorites.includes(req.params.id)) {
      user.favorites.push(req.params.id);
      await user.save();
    }
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});