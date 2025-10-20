import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';

// --- 1. IMPORT THE NEW DEDICATED CSS ---
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Your data fetching logic with Promise.all is excellent and remains.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) throw new Error('No login data found.');
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const [restaurantResponse, ordersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}//api/restaurants/myrestaurant`, config),
          axios.get(`${API_BASE_URL}//api/orders/myrestaurant`, config)
        ]);
        
        setRestaurant(restaurantResponse.data);
        setOrders(ordersResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Your metric calculation logic is perfect and remains.
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const todaysRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt).toDateString();
      const today = new Date().toDateString();
      return o.status === 'Completed' && orderDate === today;
    })
    .reduce((acc, order) => acc + order.totalPrice, 0);
  const totalCompletedOrders = orders.filter(o => o.status === 'Completed').length;

  if (loading) {
    return <div className="ra-loader-container"><div className="ra-spinner"></div></div>;
  }
  if (error) {
    return <div className="ra-message-container"><p>{error}</p></div>;
  }
  if (!restaurant) {
    return <div className="ra-message-container"><p>Could not load restaurant data.</p></div>;
  }

  return (
    <div className="ra-dashboard-container">
      <div className="ra-dashboard-header">
        <h2>Welcome, {restaurant.name}!</h2>
        <p>Here is a summary of your restaurant's activity.</p>
      </div>

      <div className="ra-stats-grid">
        {/* Card 1: Pending Orders */}
        <div className="ra-stat-card">
          <div className="title">Pending Orders</div>
          <div className="value warning">{pendingOrdersCount}</div>
          <Link to="/restaurant-admin/orders" className="action-link warning">
            View Active Orders
          </Link>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="ra-stat-card">
          <div className="title">Today's Revenue</div>
          {/* --- CURRENCY CHANGED TO BIRR --- */}
          <div className="value success">Birr {todaysRevenue.toFixed(2)}</div>
          <div className="footer-note">From completed orders</div>
        </div>

        {/* Card 3: Active Menu Items */}
        <div className="ra-stat-card">
          <div className="title">Active Menu Items</div>
          <div className="value primary">{restaurant.menu?.length || 0}</div>
          <Link to="/restaurant-admin/menu" className="action-link primary">
            Manage Menu
          </Link>
        </div>
        
        {/* Card 4: Total Completed Orders */}
        <div className="ra-stat-card">
          <div className="title">Total Completed Orders</div>
          <div className="value info">{totalCompletedOrders}</div>
          <div className="footer-note">All time</div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;