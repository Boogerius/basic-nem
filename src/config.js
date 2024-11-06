export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost/character-stories',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  emailFrom: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173', // Vue's default dev server port
  domain: process.env.DOMAIN || 'localhost'
};