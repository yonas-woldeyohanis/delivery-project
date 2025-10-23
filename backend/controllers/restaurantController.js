// backend/controllers/restaurantController.js

import Restaurant from '../models/restaurantModel.js';
import Order from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

// UPDATED to handle both creating and updating a review
const createRestaurantReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const restaurantId = req.params.id;
  const userId = req.user._id;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const hasOrdered = await Order.findOne({
    user: userId,
    restaurant: restaurantId,
    status: 'Completed',
  });

  if (!hasOrdered) {
    res.status(400);
    throw new Error('You can only review restaurants you have ordered from.');
  }

  // --- THIS IS THE NEW LOGIC ---
  const alreadyReviewed = restaurant.reviews.find(
    (r) => r.user.toString() === userId.toString()
  );

  if (alreadyReviewed) {
    // If a review exists, update it
    alreadyReviewed.rating = Number(rating);
    alreadyReviewed.comment = comment;
  } else {
    // If no review exists, create a new one
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: userId,
    };
    restaurant.reviews.push(review);
  }

  // --- The rest of the logic is the same ---
  restaurant.numReviews = restaurant.reviews.length;
  restaurant.rating =
    restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) /
    restaurant.reviews.length;

  await restaurant.save();
  
  // Send a clear message based on what happened
  res.status(201).json({ 
    message: alreadyReviewed ? 'Review updated successfully' : 'Review added successfully' 
  });
});

export { createRestaurantReview };