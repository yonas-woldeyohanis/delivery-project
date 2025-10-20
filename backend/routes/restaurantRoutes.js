// backend/routes/restaurantRoutes.js
import express from 'express';
const router = express.Router();

import Restaurant from '../models/restaurantModel.js';
import User from '../models/userModel.js';
import { protect, isRestaurantAdmin, isSuperAdmin } from '../middleware/authMiddleware.js';
import upload from '../config/upload.js';

// ===================================================
// --- 1. SUPER ADMIN ROUTES ---
// ===================================================

router.post('/', protect, isSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { restaurantName, cuisine, adminName, adminEmail, adminPassword } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : '/images/default-logo.png';

    if (!restaurantName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const restaurantExists = await Restaurant.findOne({ name: restaurantName });
    if (restaurantExists) {
      return res.status(400).json({ message: 'A restaurant with this name already exists.' });
    }
    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const newRestaurant = await Restaurant.create({
      name: restaurantName,
      cuisine: cuisine || 'Not specified',
      logo: logoPath,
    });
    const newAdminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'restaurantAdmin',
      restaurant: newRestaurant._id,
    });

    const userResponse = newAdminUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Restaurant and admin account created successfully!',
      restaurant: newRestaurant,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Server error while creating restaurant.' });
  }
});

router.delete('/:id', protect, isSuperAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      await User.deleteMany({ restaurant: restaurant._id });
      await restaurant.deleteOne();
      res.json({ message: 'Restaurant and associated admin user removed' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ===================================================
// --- 2. RESTAURANT ADMIN ROUTES ---
// ===================================================

router.get('/myrestaurant', protect, isRestaurantAdmin, async (req, res) => {
  if (req.user && req.user.restaurant) {
    res.json(req.user.restaurant);
  } else {
    res.status(404).json({ message: 'Restaurant not found for this admin.' });
  }
});

router.post('/myrestaurant/menu', protect, isRestaurantAdmin, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const restaurant = await Restaurant.findById(req.user.restaurant._id);
    if (restaurant) {
      const newItem = { name, description, price, isAvailable: true };
      restaurant.menu.push(newItem);
      await restaurant.save();
      res.status(201).json(newItem);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid item data' });
  }
});

router.put('/myrestaurant/menu/:itemId', protect, isRestaurantAdmin, async (req, res) => {
  try {
    const { name, description, price, isAvailable } = req.body;
    const restaurant = await Restaurant.findById(req.user.restaurant._id);
    if (restaurant) {
      const item = restaurant.menu.id(req.params.itemId);
      if (item) {
        item.name = name ?? item.name;
        item.description = description ?? item.description;
        item.price = price ?? item.price;
        item.isAvailable = isAvailable ?? item.isAvailable;
        await restaurant.save();
        res.json(item);
      } else {
        res.status(404).json({ message: 'Menu item not found' });
      }
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid item data' });
  }
});

router.delete('/myrestaurant/menu/:itemId', protect, isRestaurantAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurant._id);
    if (restaurant) {
      const item = restaurant.menu.id(req.params.itemId);
      if (item) {
        item.deleteOne();
        await restaurant.save();
        res.json({ message: 'Menu item removed' });
      } else {
        res.status(404).json({ message: 'Menu item not found' });
      }
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// ===================================================
// --- 3. PUBLIC ROUTES ---
// ===================================================

// --- THIS IS THE CORRECTED ROUTE ---
// GET /api/restaurants - Fetch all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    
    // Build the base URL dynamically from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Map through the restaurants and prepend the full URL to the logo path
    const restaurantsWithFullLogoUrl = restaurants.map(restaurant => {
      const restaurantObject = restaurant.toObject();
      if (restaurantObject.logo && restaurantObject.logo.startsWith('/uploads')) {
        restaurantObject.logo = `${baseUrl}${restaurantObject.logo}`;
      }
      return restaurantObject;
    });

    res.json(restaurantsWithFullLogoUrl);

  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/restaurants/:id - Fetch a single restaurant for customers
// This route MUST be last to avoid path conflicts.
router.get('/:id/public', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      // Your logic to filter the menu and send the response
      // ...
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;