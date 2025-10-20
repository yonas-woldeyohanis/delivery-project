// backend/models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  // --- NEW: Phone field added ---
  // This will store the agent's phone number. It is not required for all users.
  phone: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: true,
    default: '/images/default-avatar.png',
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'restaurantAdmin', 'agent'],
    default: 'customer',
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: function() {
      return this.role === 'restaurantAdmin';
    },
    default: null,
  },


}, {
  timestamps: true
});

// This method will run BEFORE a user document is saved
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add a method to the schema to compare entered password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;