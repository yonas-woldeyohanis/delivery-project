// backend/controllers/userController.js
import User from '../models/userModel.js';
import Restaurant from '../models/restaurantModel.js';
import generateToken from '../utils/generateToken.js';

// @desc   Register a new restaurant and its admin user
// @route  POST /api/users/register-restaurant
// @access Public
const registerRestaurant = async (req, res) => {
  // Data from the registration form
  const { userName, userEmail, userPassword, restaurantName, restaurantCuisine } = req.body;

  // --- Validation ---
  if (!userName || !userEmail || !userPassword || !restaurantName || !restaurantCuisine) {
    return res.status(400).json({ message: 'Please provide all required fields for user and restaurant.' });
  }

  // Check if a user with this email already exists
  const userExists = await User.findOne({ email: userEmail });
  if (userExists) {
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  // Check if a restaurant with this name already exists
  const restaurantExists = await Restaurant.findOne({ name: restaurantName });
  if (restaurantExists) {
    return res.status(400).json({ message: 'A restaurant with this name already exists.' });
  }

  try {
    // --- Step 1: Create the Restaurant ---
    const newRestaurant = await Restaurant.create({
      name: restaurantName,
      cuisine: restaurantCuisine,
      // logo can be added later
    });

    // --- Step 2: Create the User ---
    const newUser = await User.create({
      name: userName,
      email: userEmail,
      password: userPassword, // The password will be hashed automatically by the pre-save hook in userModel.js
      role: 'restaurantAdmin', // Assign the correct role
      restaurant: newRestaurant._id, // Link the user to the new restaurant's ID
    });

    // --- Step 3: Respond with success ---
    if (newUser && newRestaurant) {
      res.status(201).json({
        message: 'Restaurant and admin account created successfully!',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        restaurant: {
          _id: newRestaurant._id,
          name: newRestaurant.name,
          cuisine: newRestaurant.cuisine,
        },
        token: generateToken(newUser._id), // Automatically log them in
      });
    } else {
      // This is a failsafe in case something went wrong
      res.status(500).json({ message: 'Failed to create restaurant or user.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};


// We can also move your existing login/register logic here in the future
// to keep routes.js clean, but for now, we'll just export the new function.

export { registerRestaurant };