// backend/routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

// Import all the models we need to query
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Restaurant from '../models/restaurantModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/SuperAdmin
router.get('/stats', protect, isSuperAdmin, async (req, res) => {
  try {
    // Perform all database queries in parallel for efficiency
    const [
      orderCount,
      restaurantCount,
      customerCount,
      salesData,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments({}),
      Restaurant.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name')
    ]);

    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    res.json({
      orderCount,
      restaurantCount,
      customerCount,
      totalSales,
      recentOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;