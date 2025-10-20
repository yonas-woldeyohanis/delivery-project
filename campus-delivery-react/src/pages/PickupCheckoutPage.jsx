import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Import our new custom and responsive CSS ---
import './PickupCheckoutPage.css';

function PickupCheckoutPage({ cart, handleRemoveFromCart }) {
  const navigate = useNavigate();
  const [pickupInfo, setPickupInfo] = useState({ fullName: '', phone: '' });
  const [error, setError] = useState('');

  // All of your original logic is preserved.
  const handleInfoChange = (e) => {
    setPickupInfo({ ...pickupInfo, [e.target.name]: e.target.value });
  };
  
  const itemsPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const totalCost = itemsPrice; 
  
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!pickupInfo.fullName || !pickupInfo.phone) {
      setError('Please provide your name and phone number for pickup.');
      return;
    }
    
    navigate('/select-payment', { 
      state: { 
        shippingAddress: {
          fullName: pickupInfo.fullName,
          dorm: 'Self Pickup',
          phone: pickupInfo.phone,
        },
        deliveryType: 'pickup',
        totalCost: totalCost,
      } 
    });
  };
  
  const ErrorMessage = ({ message }) => (
    <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="page-title-checkout">Step 2: Pickup Information</h1>
        
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty. <Link to="/home">Go Back</Link></p>
        ) : (
          <form onSubmit={handleInfoSubmit}>
            {error && <ErrorMessage message={error} />}
            <div className="checkout-layout">
              {/* --- Left Column: Form --- */}
              <div className="checkout-form">
                <div className="info-card">
                  <h2 className="card-header-custom">Your Contact Information</h2>
                  <p className="card-subheader">We'll use this to notify you when your order is ready.</p>
                  <div className="form-group-custom">
                    <label htmlFor="fullName" className="form-label-custom">Full Name</label>
                    <input type="text" id="fullName" name="fullName" className="form-input-custom" value={pickupInfo.fullName} onChange={handleInfoChange} required />
                  </div>
                  <div className="form-group-custom">
                    <label htmlFor="phone" className="form-label-custom">Phone Number</label>
                    <input type="tel" id="phone" name="phone" className="form-input-custom" value={pickupInfo.phone} onChange={handleInfoChange} required />
                  </div>
                </div>
              </div>

              {/* --- Right Column: Order Summary --- */}
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
                  <div className="summary-total">
                    <span>Total</span>
                    {/* --- CURRENCY CHANGED TO BIRR --- */}
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

export default PickupCheckoutPage;

