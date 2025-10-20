import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// We are using the correct CSS file we already created
import './AgentDashboardPage.css';

const AgentDashboardPage = () => {

  console.log("Rendering AgentDashboardPage component...");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load is true
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // --- 1. THE LOGIC IS NOW CORRECTED AND SIMPLIFIED ---
  const fetchAvailableOrders = useCallback(async () => {
    if (!userInfo || !userInfo.token) {
      setLoading(false); // Ensure loading stops if user is not logged in
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/available', config);
      setOrders(data);
      setError(null); 
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred fetching jobs.');
      console.error("Fetch Orders Error:", err);
    } finally {
      // THIS IS THE FIX: Always set loading to false after the fetch attempt.
      // We remove the fragile "if (loading)" check.
      setLoading(false);
    }
  }, [userInfo]); // The function now ONLY depends on userInfo, which is correct.

  useEffect(() => {


    fetchAvailableOrders(); // Initial fetch
    const interval = setInterval(fetchAvailableOrders, 15000); // Subsequent background fetches
    return () => clearInterval(interval); // Cleanup
  }, [fetchAvailableOrders]);

  const handleAcceptClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setError(null);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };
  
  const handleConfirmAccept = async () => {
    if (!selectedOrder) return;
    setAcceptingId(selectedOrder._id);
    const toastId = toast.loading('Accepting job...');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${selectedOrder._id}/accept`, {}, config);
      
      setOrders(prevOrders => prevOrders.filter(o => o._id !== selectedOrder._id));
      toast.success(`Delivery #${selectedOrder.displayId} accepted!`, { id: toastId });
      handleModalClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to accept the order.';
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <>
      <div className="agent-dashboard-page">
        <div className="agent-dashboard-header">
          <h1>Available Delivery Jobs</h1>
          <p>New jobs will appear here in real-time. Ready to ride?</p>
        </div>

        {/* --- 2. THE RENDER LOGIC IS NOW CORRECT --- */}
        {loading ? (
          // Use a proper loader for the admin theme
          <div className="no-jobs-alert"><p>Loading available jobs...</p></div>
        ) : error && !showModal ? (
          <div className="no-jobs-alert" style={{borderColor: '#ef4444'}}>{error}</div>
        ) : orders.length === 0 ? (
          <div className="no-jobs-alert">
            <div className="icon"><i className="fas fa-coffee"></i></div>
            <h3>All Clear!</h3>
            <p>No available jobs at the moment. We'll keep checking!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {orders.map((order) => (
              <div key={order._id} className="job-card">
                <div className="job-card-header">Order #{order.displayId}</div>
                <div className="job-card-body">
                  <div className="job-detail">
                    <div className="label"><i className="fas fa-store"></i> PICKUP FROM</div>
                    <div className="value">{order.restaurant.name}</div>
                  </div>
                  <div className="job-detail">
                    <div className="label"><i className="fas fa-map-marker-alt"></i> DELIVER TO</div>
                    <div className="value">{order.shippingAddress.address}</div>
                  </div>
                  <div className="accept-btn-wrapper">
                    <button className="accept-btn" onClick={() => handleAcceptClick(order)}>
                      Accept Delivery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redesigned Confirmation Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delivery</h3>
              <button type="button" onClick={handleModalClose} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {selectedOrder && (
                <>
                  <p>Are you sure you want to accept this delivery?</p>
                  <p><strong>Order:</strong> #{selectedOrder.displayId}</p>
                  <p><strong>From:</strong> {selectedOrder.restaurant.name}</p>
                </>
              )}
              {error && <p style={{color: '#ef4444', marginTop: '1rem'}}>{error}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleModalClose} className="modal-btn btn-secondary-custom" disabled={!!acceptingId}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmAccept} className="modal-btn btn-primary-custom" disabled={!!acceptingId}>
                {acceptingId ? 'Accepting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDashboardPage;