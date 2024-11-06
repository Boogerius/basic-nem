// src/routes/auth.js
import express from 'express';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { config } from '../config.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';  // Add this line

export const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, characterName, bio } = req.body;
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = new User({
      email,
      password,
      characterName,
      bio,
      verificationToken
    });
    
    await user.save();
    
    // Send verification email
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    await sgMail.send({
      to: email,
      from: config.emailFrom,
      subject: 'Verify your email',
      html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
    });
    
    req.session.userId = user._id;
    res.json({ message: 'Signup successful' });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user._id;
    res.json({ 
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        characterName: user.characterName,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select('-password')
      .populate('favorites', 'characterName bio lastMessageAt');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Right here?' });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/bio', requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { bio: req.body.bio },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/account', requireAuth, async (req, res) => {
  try {
    await Message.deleteMany({ author: req.session.userId });
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});