// backend/routes/orderRoutes.js
import express from 'express';
import Order from '../models/orderModel.js';
import Restaurant from '../models/restaurantModel.js';
import { protect, isSuperAdmin, isRestaurantAdmin, isAgent } from '../middleware/authMiddleware.js';

// The entire router is now wrapped in a function that accepts 'io'
const createOrderRoutes = (io) => {
  const router = express.Router();

  // @desc    Create new order
  // @route   POST /api/orders
  // @access  Private
  router.post('/', protect, async (req, res) => {
    try {
      const {
        restaurant: restaurantId,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        serviceFee,
        totalPrice,
        deliveryAgent
      } = req.body;

      if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
      }

      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $inc: { orderCount: 1 } },
        { new: true }
      );

      if (!updatedRestaurant) {
        res.status(404);
        throw new Error('Restaurant not found.');
      }

      const restaurantNameCode = updatedRestaurant.name
        .toUpperCase()
        .replace(/\s+/g, '-')
        .substring(0, 15);

      const paddedOrderNumber = String(updatedRestaurant.orderCount).padStart(5, '0');
      const displayId = `${restaurantNameCode}-${paddedOrderNumber}`;

      const order = new Order({
        displayId,
        user: req.user._id,
        restaurant: restaurantId,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        serviceFee,
        totalPrice,
        deliveryAgent,
      });

      const createdOrder = await order.save();

// --- THIS IS THE NEW CODE ---
    // After saving the order, we need to get the full order details with user info
    // so the restaurant owner knows who ordered.
    const fullOrder = await Order.findById(createdOrder._id).populate('user', 'name');

    // Now, emit a 'newOrder' event specifically to the room for that restaurant.
    // The room name will be the restaurant's ID.
    io.to(fullOrder.restaurant.toString()).emit('newOrder', fullOrder);




      res.status(201).json(createdOrder);
      
    } catch (error) {
      console.error("Order Creation Error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // @desc    Archive old, completed orders
  // @route   POST /api/orders/archive
  // @access  Private/SuperAdmin
  router.post('/archive', protect, isSuperAdmin, async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Order.updateMany(
        { 
          isArchived: false,
          status: { $in: ['Completed', 'Cancelled'] },
          updatedAt: { $lt: thirtyDaysAgo }
        },
        { $set: { isArchived: true } }
      );

      res.json({
        message: 'Archiving process completed.',
        archivedCount: result.modifiedCount
      });

    } catch (error) {
      console.error('Archiving Error:', error);
      res.status(500).json({ message: 'Server error during archiving process.' });
    }
  });

  // @desc    Get all available orders for pickup
  // @route   GET /api/orders/available
  // @access  Private/Agent
  router.get('/available', protect, isAgent, async (req, res) => {
    try {
      const availableOrders = await Order.find({
        status: 'Ready for Pickup',
        isArchived: false,
      })
      .populate('restaurant', 'name address')
      .populate('user', 'name');
      
      res.json(availableOrders);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // @desc    Get all orders assigned to the logged-in agent
  // @route   GET /api/orders/mydeliveries
  // @access  Private/Agent
  router.get('/mydeliveries', protect, isAgent, async (req, res) => {
      try {
        const myDeliveries = await Order.find({
          deliveryAgent: req.user._id,
          status: 'Out for Delivery',
          isArchived: false,
        })
        .populate('restaurant', 'name address')
        .populate('user', 'name');
        
        res.json(myDeliveries);
      } catch (error) {
        console.error('Error fetching agent deliveries:', error);
        res.status(500).json({ message: 'Server Error' });
      }
  });

  // @desc    Get logged in user's orders
  // @route   GET /api/orders/myorders
  // @access  Private
  router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id, isArchived: false });
    res.json(orders);
  });

  // @desc    Get all orders for the logged-in restaurant admin
  // @route   GET /api/orders/myrestaurant
  // @access  Private/RestaurantAdmin
  router.get('/myrestaurant', protect, isRestaurantAdmin, async (req, res) => {
    try {
      const orders = await Order.find({ 
        restaurant: req.user.restaurant._id, 
        isArchived: false 
      })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // @desc    Get order by ID
  // @route   GET /api/orders/:id
  // @access  Private
  router.get('/:id', protect, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('user', 'name email');

      if (order) {
        const isAuthorized =
          order.user._id.toString() === req.user._id.toString() ||
          req.user.isAdmin ||
          (order.deliveryAgent && order.deliveryAgent.toString() === req.user._id.toString());
          
        if (!isAuthorized) {
          res.status(401);
          throw new Error('Not authorized to view this order');
        }
        res.json(order);
      } else {
        res.status(404);
        throw new Error('Order not found');
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // @desc    Update an order's status by Restaurant
  // @route   PUT /api/orders/:id/status
  // @access  Private/RestaurantAdmin
  router.put('/:id/status', protect, isRestaurantAdmin, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (order) {
        if (order.restaurant.toString() !== req.user.restaurant._id.toString()) {
          res.status(401);
          throw new Error('Not authorized to update this order');
        }
        
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        
        // Emit the WebSocket event
        io.to(updatedOrder._id.toString()).emit('orderStatusUpdated', updatedOrder);
        
        res.json(updatedOrder);

      } else {
        res.status(404);
        throw new Error('Order not found');
      }
    } catch (error) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
  });

  // @desc    Assign an order to the logged-in agent and update status
  // @route   PUT /api/orders/:id/accept
  // @access  Private/Agent
  router.put('/:id/accept', protect, isAgent, async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
    
        if (order) {
          if (order.status !== 'Ready for Pickup') {
            res.status(400);
            throw new Error('Order is not available for pickup.');
          }

          order.deliveryAgent = req.user._id;
          order.status = 'Out for Delivery';
          
          const updatedOrder = await order.save();

          // Emit the WebSocket event
          io.to(updatedOrder._id.toString()).emit('orderStatusUpdated', updatedOrder);
          
          res.json(updatedOrder);
    
        } else {
          res.status(404);
          throw new Error('Order not found');
        }
      } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
      }
    });

  // @desc    Mark an assigned order as 'Completed'
  // @route   PUT /api/orders/:id/complete
  // @access  Private/Agent
  router.put('/:id/complete', protect, isAgent, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (order) {
        if (!order.deliveryAgent || order.deliveryAgent.toString() !== req.user._id.toString()) {
          res.status(403);
          throw new Error('Not authorized to modify this order.');
        }
        
        order.status = 'Completed';
        
        const updatedOrder = await order.save();
        
        // Emit the WebSocket event
        io.to(updatedOrder._id.toString()).emit('orderStatusUpdated', updatedOrder);
        
        res.json(updatedOrder);

      } else {
        res.status(404);
        throw new Error('Order not found');
      }
    } catch (error) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
  });



// @desc    Get all orders (for Super Admin) with filtering and search
// @route   GET /api/orders
// @access  Private/SuperAdmin
router.get('/', protect, isSuperAdmin, async (req, res) => {
  try {
    // --- THIS IS THE FIX ---
    // Helper function to escape special characters in the search string
    const escapeRegex = (text) => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };

    const query = { isArchived: false };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      // Use the helper function to create a safe regex pattern
      const safeSearchPattern = new RegExp(escapeRegex(req.query.search), 'i');
      query.displayId = { $regex: safeSearchPattern };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'id name')
      .populate('restaurant', 'id name')
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


  // Return the configured router instance
  return router;
};

// Export the create function
export default createOrderRoutes;