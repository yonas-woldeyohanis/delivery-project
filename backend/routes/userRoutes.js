// backend/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

import { protect } from '../middleware/authMiddleware.js';
// --- 1. IMPORT YOUR EXISTING UPLOAD CONFIG ---
import upload from '../config/upload.js';


// @desc   Authenticate user & get token (Login)
// @route  POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // --- UPDATE: Also send back the profile picture ---
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture, // Added this line
        restaurant: user.restaurant,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Login Error: ${error}`);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @desc   Register a new CUSTOMER
// @route  POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = await User.create({ name, email, password });

    if (user) {
      // --- UPDATE: Also send back the default profile picture ---
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture, // Added this line
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`Register Error: ${error}`);
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- 2. ADD THE NEW PROFILE MANAGEMENT ROUTES ---

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile (name, email, picture)
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.file) {
        user.profilePicture = `/${req.file.path.replace(/\\/g, "/")}`;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});


// @desc    Update user password
// @route   PUT /api/users/profile/change-password
// @access  Private
router.put('/profile/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    console.error('Password Change Error:', error);
    res.status(400).json({ message: 'Error updating password' });
  }
});


export default router;