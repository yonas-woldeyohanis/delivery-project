import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import './SelectPaymentPage.css';

const SelectPaymentPage = ({ cart }) => { // onClearCart is no longer needed
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // --- 1. THE DATA HANDLING IS NOW SAFE ---
  const { 
    selectedAgent, 
    shippingAddress, 
    deliveryType,
    totalCost, // From the original, working pages
    costDetails // From our new, updated pages
  } = location.state || {};

  // This is the key: it safely determines the final cost, no matter which data structure is passed.
  const finalTotalCost = costDetails ? costDetails.totalCost : totalCost;

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    // Safety checks remain
    if (!shippingAddress) navigate('/select-agent');
    if (cart.length === 0) navigate('/');
  }, [shippingAddress, cart, navigate]);

  // --- 2. THE CHAPA PAYMENT HANDLER IS NOW FULLY IMPLEMENTED ---
  const handleChapaPayment = async () => {
    setLoading(true);
    const toastId = toast.loading('Initializing payment...');

    try {
      if (!userInfo || !userInfo.token) {
        throw new Error('You must be logged in to pay.');
      }
      if (!finalTotalCost || finalTotalCost <= 0) {
        throw new Error('Invalid total cost.');
      }

      const tx_ref = `TX-${userInfo._id}-${Date.now()}`;
      
      const paymentInitData = {
        amount: finalTotalCost,
        currency: 'ETB',
        email: userInfo.email,
        first_name: userInfo.name.split(' ')[0],
        last_name: userInfo.name.split(' ').slice(1).join(' ') || userInfo.name.split(' ')[0],
        tx_ref: tx_ref,
      };
      
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // We pass the new or old cost structure, whichever exists
      const costDataToStore = costDetails ? costDetails : { totalCost: finalTotalCost };

      const pendingOrderData = {
        cart, selectedAgent, shippingAddress, deliveryType, costDetails: costDataToStore, tx_ref
      };
      localStorage.setItem('pendingOrder', JSON.stringify(pendingOrderData));

      const { data } = await axios.post('/api/payment/initialize-chapa', paymentInitData, config);

      if (data.checkout_url) {
        toast.success('Redirecting to Chapa...', { id: toastId });
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Could not get payment URL.');
      }

    } catch (err) {
      toast.error(err.message || 'Payment initialization failed.', { id: toastId });
      setLoading(false);
    }
  };

  if (!shippingAddress) return null;

  return (
    <div className="payment-page-wrapper">
      <div className="payment-selection-container">
        <div className="payment-header">
          <h1>Final Step: Secure Payment</h1>
          <p>Select your preferred payment method to complete the order.</p>
        </div>
        
        <div className="payment-options-grid">
          {/* --- 3. "CASH ON DELIVERY" OPTION IS REMOVED --- */}

          {/* Option 1: Chapa */}
          <div className="payment-option-card" onClick={() => !loading && handleChapaPayment()}>
            <div>
              <i className="fas fa-shield-alt payment-icon icon-chapa"></i>
              <h3 className="payment-title">Pay with Chapa</h3>
              <p className="payment-description">Securely pay with Telebirr, CBE, and all major Ethiopian banks.</p>
            </div>
            <button className="payment-button btn-chapa" disabled={loading}>
              {loading ? 'Initializing...' : `Pay Birr ${finalTotalCost ? finalTotalCost.toFixed(2) : '0.00'}`}
            </button>
          </div>

          {/* Option 2: Bank Transfer (Kept as disabled) */}
          <div className="payment-option-card disabled">
            <div className="soon-badge">Coming Soon</div>
            <div>
              <i className="fas fa-university payment-icon icon-bank"></i>
              <h3 className="payment-title">Bank Transfer</h3>
              <p className="payment-description">Directly transfer payment from your bank account. Details provided after checkout.</p>
            </div>
            <button className="payment-button btn-disabled" disabled>
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPaymentPage;