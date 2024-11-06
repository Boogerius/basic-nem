import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  characterName: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessageAt: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);