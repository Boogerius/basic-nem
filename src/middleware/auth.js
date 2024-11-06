import { User } from '../models/User.js';

export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export const requireVerified = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = await User.findById(req.session.userId);
  if (!user.isVerified) {
    return res.status(403).json({ error: 'Email not verified' });
  }
  
  next();
};