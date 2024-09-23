const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, unique: true },
  password: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true },
  googleId: { type: String },
  role: { type: String,  enum: ['user', 'worker', 'admin'], default: 'user' },
}, {
  timestamps: true // Enable timestamps to automatically add `createdAt` and `updatedAt`
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
