import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast'; // --- 1. IMPORT TOAST ---
import API_BASE_URL from '../config'; 

// --- 2. IMPORT OUR NEW CSS ---
import './OrderDetailPage.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket;

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // WebSocket connection logic now uses toasts for notifications
  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.emit("joinOrderRoom", orderId);
    socket.on("orderStatusUpdated", (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        // --- 3. USE TOAST FOR REAL-TIME NOTIFICATIONS ---
        toast.success(`Order status updated to: ${updatedOrder.status}`);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // Initial data fetching logic remains the same
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
       const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, config);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  // --- 4. NEW: Status Tracker Component ---
  const StatusTracker = ({ currentStatus }) => {
    const statuses = ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
      <div className="status-tracker">
        {statuses.map((status, index) => (
          <div key={status} className={`status-step ${index < currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}>
            <div className="status-dot"></div>
            <div className="status-label">{status}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="order-detail-page"><div className="loader-container-detail"><div className="spinner-detail"></div></div></div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page"><div className="message-container-detail"><p className="message-detail">{error}</p></div></div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="detail-container">
        {order ? (
          <>
            <h1 className="page-title-detail">Order #{order.displayId}</h1>
            <div className="detail-layout">
              {/* --- Left Column: Details --- */}
              <div className="detail-info">
                <div className="info-card-detail">
                  <h2>Order Status</h2>
                  <StatusTracker currentStatus={order.status} />
                </div>
                <div className="info-card-detail">
                  <h2>Shipping</h2>
                  <p><strong>Name: </strong> {order.user.name}</p>
                  <p><strong>Address: </strong>
                    {order.shippingAddress.isPickup ? `Self Pickup at Restaurant` : order.shippingAddress.address}
                  </p>
                </div>
                <div className="info-card-detail">
                  <h2>Order Items</h2>
                  <ul className="order-items-list">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="order-item-row">
                        <span className="item-name-detail">{item.name}</span>
                        {/* --- CURRENCY CHANGED TO BIRR --- */}
                        <span>Birr {item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* --- Right Column: Summary --- */}
              <div className="detail-summary">
                <div className="summary-card-detail">
                  <h2>Order Summary</h2>
                  <div className="summary-row">
                    <span>Items</span>
                    <span>Birr {order.itemsPrice.toFixed(2)}</span>
                  </div>
                  {order.serviceFee > 0 && (
                    <div className="summary-row">
                      <span>Service Fee</span>
                      <span>Birr {order.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row summary-total-row">
                    <span>Total</span>
                    <span>Birr {order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="message-container-detail"><p className="message-detail">Order not found.</p></div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;