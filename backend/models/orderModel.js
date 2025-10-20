// backend/models/orderModel.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  displayId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  orderItems: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Restaurant.menu' }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    isPickup: { type: Boolean, default: false }
  },
  paymentMethod: {
      type: String,
      required: true,
      default: 'Cash on Delivery'
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  serviceFee: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null,
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false,
  },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required:true, default: false },
  deliveredAt: { type: Date },
  
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;