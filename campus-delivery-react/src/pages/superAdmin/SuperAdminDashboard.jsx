import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';

// Import the new dedicated CSS for the admin dashboard
import './SuperAdminDashboard.css';

// Custom StatCard component designed to work with our new CSS
const StatCard = ({ title, value, icon, variant }) => (
  <div className="stat-card-admin">
    <div className="stat-info">
      <div className="title">{title}</div>
      <div className="value">{value}</div>
    </div>
    <div className={`stat-icon ${variant}`}>
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  // Data fetching logic remains the same
  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, config);
      setStats(data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Helper for status badge CSS classes
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Pending': return 'pending';
      // Add more cases here if needed for other statuses
      default: return 'secondary';
    }
  };

  // Archive handler updated with professional toast notifications
  const handleArchiveOrders = async () => {
    if (!window.confirm('Are you sure you want to archive old orders? This action cannot be undone.')) {
      return;
    }
    setIsArchiving(true);
    const toastId = toast.loading('Archiving orders...');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`${API_BASE_URL}/api/orders/archive`, {}, config);
      
      toast.success(`${data.archivedCount} orders have been archived.`, { id: toastId });
      fetchStats(); // Re-fetch data to update the UI
    } catch (err) {
      toast.error('Archiving failed. Please try again.', { id: toastId });
      console.error(err);
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loader-container-admin">
          <div className="spinner-admin-page"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>An overview of your platform's activity.</p>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <StatCard title="Total Revenue" value={`Birr ${stats.totalSales.toFixed(2)}`} icon="fa-dollar-sign" variant="success"/>
            <StatCard title="Total Orders" value={stats.orderCount} icon="fa-shopping-cart" variant="info"/>
            <StatCard title="Total Customers" value={stats.customerCount} icon="fa-users" variant="warning"/>
            <StatCard title="Total Restaurants" value={stats.restaurantCount} icon="fa-utensils" variant="danger"/>
          </div>

          <div className="maintenance-card">
            <h3>Platform Maintenance</h3>
            <p>Clean up the database by archiving 'Completed' or 'Cancelled' orders older than 30 days.</p>
            <button className="archive-btn" onClick={handleArchiveOrders} disabled={isArchiving}>
              {isArchiving && <div className="spinner-admin-page" style={{width: '20px', height: '20px'}}></div>}
              {isArchiving ? 'Archiving...' : 'Archive Old Orders'}
            </button>
          </div>

          <h2 className="recent-orders-header">Recent Orders</h2>
          <div className="orders-list-admin">
            {stats.recentOrders.map(order => (
              <div key={order._id} className="order-row-card">
                <div className="order-cell-admin">
                  <div className="label">ORDER ID</div>
                  <div className="value"><Link to={`/order/${order._id}`}><strong>{order.displayId}</strong></Link></div>
                </div>
                <div className="order-cell-admin">
                  <div className="label">CUSTOMER</div>
                  <div className="value">{order.user ? order.user.name : 'N/A'}</div>
                </div>
                <div className="order-cell-admin">
                  <div className="label">DATE</div>
                  <div className="value">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="order-cell-admin">
                  <div className="label">TOTAL</div>
                  <div className="value">Birr {order.totalPrice.toFixed(2)}</div>
                </div>
                <div className="order-cell-admin full-width">
                  <div className="label">STATUS</div>
                  <div className="value"><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></div>
                </div>
              </div>
              
            ))}
          </div>
        </>
      )}
      
    </div>
    
  );
};

export default SuperAdminDashboard;