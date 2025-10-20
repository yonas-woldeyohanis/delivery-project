import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config'; 

// --- Import our new custom and responsive CSS ---
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This data-fetching logic is perfect and remains unchanged.
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
          throw new Error('You must be logged in to view your order history.');
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/api/orders/myorder`, config);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  // Helper function to get the correct CSS class for status badges
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Preparing': return 'preparing';
      case 'Ready for Pickup': return 'ready-for-pickup';
      case 'Out for Delivery': return 'out-for-delivery';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loader-container-history"><div className="spinner-history"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <div className="message-container">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="order-history-page">
      <div className="history-container">
        <h1 className="page-title-history">My Order History</h1>

        {orders.length === 0 ? (
          <div className="message-container">
            You have no past orders. <Link to="/home">Start shopping!</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card-custom">
                {/* Order ID */}
                <div className="order-info order-id">
                  <div className="info-label">ORDER ID</div>
                  <div className="info-value order-id">{order.displayId || order._id.slice(-8).toUpperCase()}</div>
                </div>
                {/* Date */}
                <div className="order-info order-date">
                  <div className="info-label">DATE</div>
                  <div className="info-value">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                {/* Total */}
                <div className="order-info order-total">
                  <div className="info-label">TOTAL</div>
                  <div className="info-value">Birr {order.totalPrice.toFixed(2)}</div>
                </div>
                {/* Status */}
                <div className="order-info order-status">
                  <div className="info-label">STATUS</div>
                  <div className="info-value">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                {/* Details Button */}
                <Link to={`/order/${order._id}`} className="details-btn">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;