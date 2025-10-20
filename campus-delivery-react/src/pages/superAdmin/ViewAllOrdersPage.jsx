import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import './ManageAdminPages.css';

const ViewAllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAllOrders = useCallback(async () => {
    // We don't set loading to true here because the initial load is handled by useEffect
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}` },
        params: {
          search: searchTerm,
          status: statusFilter,
        }
      };
      
      const { data } = await axios.get(`${API_BASE_URL}/api/orders`, config);
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false); // Ensure loading is always turned off
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setLoading(true); // Set loading to true only for the initial fetch cycle
    const handler = setTimeout(() => {
      fetchAllOrders();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, fetchAllOrders]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Preparing': return 'preparing';
      case 'Ready for Pickup': return 'ready';
      case 'Out for Delivery': return 'delivery';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      default: return 'secondary';
    }
  };

  return (
    <div className="manage-page-container">
      <div className="manage-page-header">
        <h1>All Customer Orders</h1>
      </div>
      <p style={{color: '#9ca3af', marginTop: '-1.5rem', marginBottom: '2rem'}}>
        Search and filter all non-archived orders on the platform.
      </p>

      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by Order ID (e.g., REST-00001)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p style={{color: '#ef4444'}}>{error}</p>
      ) : (
        <div className="item-list-admin">
          {orders.length === 0 ? (
            <p>No orders found matching your criteria.</p>
          ) : (
            orders.map((order) => (
              // --- THIS IS THE CORRECTED PART ---
              // The content inside this div was missing before.
              <div 
                key={order._id} 
                className="item-row-card" 
                style={{ gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.5fr 1fr 1fr' }}
              >
                <div className="item-cell-admin">
                  <div className="label">ORDER ID</div>
                  <div className="value"><Link to={`/order/${order._id}`}><strong>{order.displayId}</strong></Link></div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">CUSTOMER</div>
                  <div className="value">{order.user ? order.user.name : 'N/A'}</div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">RESTAURANT</div>
                  <div className="value">{order.restaurant ? order.restaurant.name : 'N/A'}</div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">DATE</div>
                  <div className="value">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">TOTAL</div>
                  <div className="value">Birr {order.totalPrice.toFixed(2)}</div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">STATUS</div>
                  <div className="value">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ViewAllOrdersPage;