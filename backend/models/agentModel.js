// backend/models/agentModel.js
import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false, // Optional as requested
  },
  profilePhoto: {
    type: String, // We will store the path to the uploaded image
    required: true,
    default: '/images/default-avatar.png',
  },
  rating: {
    type: Number,
    required: true,
    default: 5, // Default rating for new agents
  },
  // You can add more fields later like 'isAvailable', 'currentOrders', etc.
}, {
  timestamps: true,
});

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;