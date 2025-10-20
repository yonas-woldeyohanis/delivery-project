import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Import the custom CSS
import './CheckoutPage.css';

function CheckoutPage({ cart, handleRemoveFromCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedAgent, deliveryType } = location.state || {};
  
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', dorm: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // Safety check: if no agent is selected, user shouldn't be here.
    // This is especially important for delivery-type orders.
    if (deliveryType === 'delivery' && !selectedAgent) {
      navigate('/select-agent');
    }
  }, [selectedAgent, deliveryType, navigate]);

  const handleInfoChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };
  
  // --- THIS IS THE CORRECTED, DETAILED COST CALCULATION ---
  const itemsPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = deliveryType === 'delivery' ? 30.00 : 0; // Only charge delivery fee if it's a delivery
  const serviceFeeRate = 0.05; // 5%
  const serviceFee = itemsPrice * serviceFeeRate;
  const totalCost = itemsPrice + deliveryFee + serviceFee;
  
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.dorm || !shippingAddress.phone) {
      setError('Please fill out all delivery information fields.');
      return;
    }
    
    // Pass the detailed cost breakdown to the payment page
    navigate('/select-payment', { 
      state: {
        selectedAgent: selectedAgent,
        shippingAddress: shippingAddress,
        deliveryType: deliveryType,
        costDetails: {
          itemsPrice,
          deliveryFee,
          serviceFee,
          totalCost
        }
      } 
    });
  };

  const ErrorMessage = ({ message }) => (
    <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="page-title-checkout">Step 2: Delivery Information</h1>
        
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty. <Link to="/home">Go Back</Link></p>
        ) : (
          <form onSubmit={handleInfoSubmit}>
            {error && <ErrorMessage message={error} />}
            <div className="checkout-layout">
              {/* --- Left Column: Form (This is the full, correct form) --- */}
              <div className="checkout-form">
                <div className="info-card">
                  <h2 className="card-header-custom">Where should we deliver?</h2>
                  <div className="form-group-custom">
                    <label htmlFor="fullName" className="form-label-custom">Full Name</label>
                    <input type="text" id="fullName" name="fullName" className="form-input-custom" value={shippingAddress.fullName} onChange={handleInfoChange} required />
                  </div>
                  <div className="form-group-custom">
                    <label htmlFor="dorm" className="form-label-custom">Dorm / Block Number</label>
                    <input type="text" id="dorm" name="dorm" className="form-input-custom" value={shippingAddress.dorm} onChange={handleInfoChange} required />
                  </div>
                  <div className="form-group-custom">
                    <label htmlFor="phone" className="form-label-custom">Phone Number</label>
                    <input type="tel" id="phone" name="phone" className="form-input-custom" value={shippingAddress.phone} onChange={handleInfoChange} required />
                  </div>
                </div>

                <div className="info-card">
                  <h2 className="card-header-custom">Your Delivery Agent</h2>
                  {selectedAgent ? (
                    <div className="agent-display">
                      <img src={selectedAgent.profilePicture} alt={selectedAgent.name} />
                      <strong>{selectedAgent.name}</strong>
                      <Link to="/select-agent" className="change-agent-link">Change</Link>
                    </div>
                  ) : (
                    <p>No agent selected for this delivery.</p>
                  )}
                </div>
              </div>

              {/* --- Right Column: Order Summary (This has the detailed breakdown) --- */}
              <div className="checkout-summary">
                <div className="summary-card">
                  <h2 className="card-header-custom">Order Summary</h2>
                  <ul className="summary-list">
                    {cart.map((item, index) => (
                      <li key={index} className="summary-item">
                        <span>{item.name}</span>
                        <button type="button" className="remove-item-btn" onClick={() => handleRemoveFromCart(index)}>X</button>
                      </li>
                    ))}
                  </ul>
                  {/* --- THE DETAILED FEE BREAKDOWN --- */}
                  <div className="summary-fee">
                    <span>Subtotal</span>
                    <span>Birr {itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-fee">
                    <span>Delivery Fee</span>
                    <span>Birr {deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="summary-fee">
                    <span>Service Fee ({serviceFeeRate * 100}%)</span>
                    <span>Birr {serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>Birr {totalCost.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="proceed-btn">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;