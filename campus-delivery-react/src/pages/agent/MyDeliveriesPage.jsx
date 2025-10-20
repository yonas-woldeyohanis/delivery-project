import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config'; 

// We are reusing the same CSS file for a consistent look and feel
import './AgentDashboardPage.css';

const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load is true
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // --- 1. THE LOGIC IS NOW CORRECTED AND SIMPLIFIED ---
  const fetchMyDeliveries = useCallback(async () => {
    if (!userInfo || !userInfo.token) {
      setLoading(false); // Ensure loading stops if user is not logged in
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
     const { data } = await axios.get(`${API_BASE_URL}/api/orders/mydeliveries`, config);
      setDeliveries(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your deliveries.');
    } finally {
      // THIS IS THE FIX: Always set loading to false after the fetch attempt.
      setLoading(false);
    }
  }, [userInfo]); // The function now ONLY depends on userInfo.

  useEffect(() => {
    fetchMyDeliveries();
  }, [fetchMyDeliveries]);

  // --- 2. COMPLETE DELIVERY HANDLER IS UPDATED WITH TOASTS ---
  const handleCompleteDelivery = async (orderId, displayId) => {
    if (window.confirm(`Are you sure you want to mark order #${displayId} as complete?`)) {
      setCompletingId(orderId);
      const toastId = toast.loading('Completing delivery...');
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(
  `${API_BASE_URL}/api/orders/${orderId}/complete`, {}, config);
        
        // Optimistic UI update: remove the card instantly
        setDeliveries(prev => prev.filter(d => d._id !== orderId));
        toast.success('Delivery completed successfully!', { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to complete delivery.', { id: toastId });
      } finally {
        setCompletingId(null);
      }
    }
  };
  
  return (
    <div className="agent-dashboard-page">
      <div className="agent-dashboard-header">
        <h1>My Active Deliveries</h1>
        <p>These are the jobs you have accepted and are currently delivering.</p>
      </div>

      {/* --- 3. THE RENDER LOGIC IS NOW CORRECT --- */}
      {loading ? (
        <div className="no-jobs-alert"><p>Loading your deliveries...</p></div>
      ) : error ? (
        <div className="no-jobs-alert" style={{borderColor: '#ef4444'}}>{error}</div>
      ) : deliveries.length === 0 ? (
        <div className="no-jobs-alert">
          <div className="icon"><i className="fas fa-search"></i></div>
          <h3>You have no active deliveries.</h3>
          <p><Link to="/agent-admin/dashboard" style={{color: '#FBD786'}}>Go to the dashboard</Link> to find new jobs.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {deliveries.map((order) => (
            <div key={order._id} className="job-card">
              <div className="job-card-header">Order #{order.displayId}</div>
              <div className="job-card-body">
                <div className="job-detail">
                  <div className="label"><i className="fas fa-user"></i> CUSTOMER</div>
                  <div className="value">{order.user.name}</div>
                </div>
                <div className="job-detail">
                  <div className="label"><i className="fas fa-store"></i> PICKUP FROM</div>
                  <div className="value">{order.restaurant.name}</div>
                </div>
                <div className="job-detail">
                  <div className="label"><i className="fas fa-map-marker-alt"></i> DELIVER TO</div>
                  <div className="value">{order.shippingAddress.address}</div>
                </div>
                <div className="accept-btn-wrapper">
                  <button 
                    className="accept-btn" 
                    disabled={completingId === order._id}
                    onClick={() => handleCompleteDelivery(order._id, order.displayId)}
                    style={{ background: '#16a34a', color: 'white' }} // Green color for complete
                  >
                    {completingId === order._id ? 'Marking...' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDeliveriesPage;