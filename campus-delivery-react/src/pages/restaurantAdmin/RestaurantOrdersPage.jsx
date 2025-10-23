import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client'; // --- 1. IMPORT SOCKET.IO-CLIENT ---
import API_BASE_URL from '../../config';
import './ManageRestaurantPages.css';


// --- 2. DEFINE SOCKET URL AND INITIALIZE SOCKET ---
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket;

const RestaurantOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get user info to know which restaurant room to join
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const getApiConfig = () => {
    return { headers: { Authorization: `Bearer ${userInfo.token}` }};
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/myrestaurant`, getApiConfig());
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);


  // --- 3. THE REAL-TIME LOGIC ---
  useEffect(() => {
    if (!userInfo) return;

    // Establish connection
    socket = io(SOCKET_URL);

    // Create a notification audio object
    const notificationSound = new Audio('/notification.mp3');
    // notification.mp3

    // Join the room for this specific restaurant
    // The restaurant ID is part of the restaurantAdmin's userInfo
    socket.emit('joinOrderRoom', userInfo.restaurant);

    // Listen for 'newOrder' events from the server
    socket.on('newOrder', (newOrderData) => {
      // Add the new order to the top of the list
      setOrders((prevOrders) => [newOrderData, ...prevOrders]);
      
      // Play the sound and show a toast
      notificationSound.play();
      toast.success(`New Order Received! #${newOrderData.displayId}`);
    });

    // Cleanup on component unmount: disconnect the socket
    return () => {
      socket.disconnect();
    };
  }, [userInfo]); // This effect depends on userInfo


  // Status change handler remains the same
  const handleStatusChange = async (orderId, newStatus) => {
    const toastId = toast.loading('Updating status...');
    try {
      await axios.put(
  `${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, getApiConfig());
      toast.success('Status updated!', { id: toastId });
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      toast.error('Failed to update status.', { id: toastId });
    }
  };

  if (loading) return <div className="ra-loader-container"><div className="ra-spinner"></div></div>;
  if (error) return <div className="ra-message-container">{error}</div>;

  return (
    <div className="ra-manage-page">
      <div className="ra-manage-header">
        <h2>Active Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="ra-message-container">You have no active orders.</div>
      ) : (
        <div className="ra-item-list">
          {orders.map((order) => (
            <div key={order._id} className="ra-order-card">
  <div className="ra-item-cell">
    <div className="label">Order ID</div>
    <div className="value value-id">{order.displayId}</div>
  </div>
  <div className="ra-item-cell">
    <div className="label">Customer</div>
    <div className="value">{order.user ? order.user.name : 'N/A'}</div>
  </div>

  {/* --- NEW: Added the Order Time --- */}
  <div className="ra-item-cell">
    <div className="label">Time</div>
    <div className="value">{new Date(order.createdAt).toLocaleTimeString()}</div>
  </div>

  <div className="ra-item-cell full-width">
    <div className="label">Items</div>
    <ul className="items-list">
      {order.orderItems.map(item => <li key={item._id}>{item.name}</li>)}
    </ul>
  </div>
  <div className="ra-item-cell">
    <div className="label">Total</div>
    <div className="value">Birr {order.totalPrice.toFixed(2)}</div>
  </div>
  <div className="ra-item-cell full-width">
    <div className="label">Update Status</div>
    <select
      className="status-select"
      value={order.status}
      onChange={(e) => handleStatusChange(order._id, e.target.value)}
    >
      <option value="Pending">Pending</option>
      <option value="Preparing">Preparing</option>
      <option value="Ready for Pickup">Ready for Pickup</option>
      <option value="Out for Delivery" disabled>Out for Delivery</option>
      <option value="Completed">Completed</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  </div>
</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrdersPage;