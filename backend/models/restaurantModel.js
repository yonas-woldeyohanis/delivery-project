import mongoose from 'mongoose';

// --- NEW: A schema for a single review ---
// This defines the structure for each review object.
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // The name of the user who wrote the review
    rating: { type: Number, required: true }, // The star rating (e.g., 1-5)
    comment: { type: String, required: true }, // The text of the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This creates a link to the User model
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps to each review
  }
);

// This is your existing schema, which we will now add to.
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
  // --- Your existing fields (I have kept them exactly as they were) ---
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
  orderCount: {
    type: Number,
    required: true,
    default: 0,
  },

  // --- NEW FIELDS ADDED HERE ---
  reviews: [reviewSchema], // An array that will hold all reviews for the restaurant
  
  rating: {
    // The calculated average rating of all reviews
    type: Number,
    required: true,
    default: 0,
  },
  
  numReviews: {
    // The total number of reviews the restaurant has
    type: Number,
    required: true,
    default: 0,
  },
  
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

export default Restaurant;