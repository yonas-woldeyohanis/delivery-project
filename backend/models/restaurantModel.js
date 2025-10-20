// backend/models/restaurantModel.js
import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: false,
  },
  menu: [MenuItemSchema],

  // --- THIS IS THE NEW FIELD ---
  // This field will track the number of orders for this specific restaurant.
  orderCount: {
    type: Number,
    required: true,
    default: 0,
  },

}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

export default Restaurant;