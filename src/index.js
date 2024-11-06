import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import 'dotenv/config';
import sgMail from '@sendgrid/mail';
import cors from 'cors';
import { router as authRoutes } from './routes/auth.js';
import { router as characterRoutes } from './routes/characters.js';
import { router as messageRoutes } from './routes/messages.js';
import { router as favoriteRoutes } from './routes/favorites.js';
import { config } from './config.js';

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoUri);

// Configure CORS
app.use(cors({
  origin: config.clientUrl, // You'll need to add this to config.js
  credentials: true, // This is important for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure session middleware
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: config.mongoUri,
    ttl: 24 * 60 * 60, // Session TTL in seconds (1 day)
    autoRemove: 'native' // Enable automatic removal of expired sessions
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? config.domain : undefined,
    httpOnly: true // Prevent javascript access to the cookie
  }
}));

// Configure SendGrid
sgMail.setApiKey(config.sendGridApiKey);

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/favorites', favoriteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});