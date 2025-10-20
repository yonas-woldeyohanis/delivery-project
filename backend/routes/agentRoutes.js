// backend/routes/agentRoutes.js
import express from 'express';
const router = express.Router();

import User from '../models/userModel.js'; 
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';
import upload from '../config/upload.js';

// @desc    Fetch all agents (users with role 'agent')
// @route   GET /api/agents
// @access  Public <-- CORRECTED: This route is now Public for customers
// --- REMOVED 'protect' and 'isSuperAdmin' middleware from this route ---
router.get('/', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const agentsWithFullPhotoUrl = agents.map(agent => {
      const agentObject = agent.toObject();
      if (agentObject.profilePicture && agentObject.profilePicture.startsWith('/uploads')) {
        agentObject.profilePicture = `${baseUrl}${agentObject.profilePicture}`;
      }
      return agentObject;
    });
    res.json(agentsWithFullPhotoUrl);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Super Admin creates a new agent (as a User)
// @route   POST /api/agents
// @access  Private/SuperAdmin <-- CORRECTED: This route REMAINS private
router.post('/', protect, isSuperAdmin, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const profilePhotoPath = req.file ? `/uploads/${req.file.filename}` : '/images/default-avatar.png';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Full Name, Email, and Password are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // We create the user. If 'phone' is not in the model, it will be ignored.
    const agentUser = await User.create({
      name,
      email,
      password,
      phone, // Sending this now, will add to model in next step.
      role: 'agent',
      profilePicture: profilePhotoPath,
    });

    if (agentUser) {
        const createdAgent = {
            _id: agentUser._id,
            name: agentUser.name,
            email: agentUser.email,
            phone: agentUser.phone,
            role: agentUser.role,
            profilePicture: agentUser.profilePicture
        };
       res.status(201).json(createdAgent);
    } else {
        res.status(400).json({ message: 'Invalid user data.'})
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating agent', error: error.message });
  }
});

// @desc    Super Admin deletes an agent
// @route   DELETE /api/agents/:id
// @access  Private/SuperAdmin <-- CORRECTED: This route REMAINS private
router.delete('/:id', protect, isSuperAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.role === 'agent') {
            await user.deleteOne();
            res.json({ message: 'Agent removed' });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;