// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // --- IMPROVEMENT ---
      // Fetch the user AND automatically populate the 'restaurant' field with full restaurant details.
      // This is more efficient than doing it in every route.
      // We also exclude the password from being attached to the request object.
      req.user = await User.findById(decoded.id).populate('restaurant').select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();

    } catch (error) {
      console.error('[authMiddleware] Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// This function checks if the user is a Restaurant Admin
const isRestaurantAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'restaurantAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Restaurant Admin' });
  }
};

// This function checks if the user is a Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) { 
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Super Admin' });
  }
};

// --- NEW AGENT FUNCTION ---
// This function checks if the user is a Delivery Agent
const isAgent = (req, res, next) => {
  if (req.user && req.user.role === 'agent') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Agent' });
  }
};

// --- UPDATED EXPORTS ---
// Now we export all four functions
export { 
  protect, 
  isRestaurantAdmin,
  isSuperAdmin,
  isAgent, // <-- Added isAgent here
};