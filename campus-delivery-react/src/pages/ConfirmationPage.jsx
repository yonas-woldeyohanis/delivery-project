import React, { useRef } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

// --- Import our new custom and responsive CSS ---
import './ConfirmationPage.css';

function ConfirmationPage() {
  const receiptRef = useRef(null);
  const location = useLocation();

  const { order } = location.state || {};

  // Your safety check and data destructuring are perfect and remain.
  if (!order) {
    return <Navigate to="/home" replace />;
  }
  
  const { displayId, createdAt, shippingAddress, orderItems, itemsPrice, serviceFee, totalPrice } = order;

  const handleDownloadReceipt = () => {
    const customerName = shippingAddress.fullName || 'receipt';
    html2canvas(receiptRef.current, { backgroundColor: '#ffffff' }).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `receipt-${customerName.replace(/\s+/g, '-')}-${displayId}.png`;
      link.click();
    });
  };

  return (
    <div className="confirmation-page">
      <div className="success-banner">
        <div className="success-icon">✔</div>
        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-message">
          Thank you, {shippingAddress.fullName}! Your food is being prepared.
        </p>
      </div>

      <div ref={receiptRef} className="receipt-card">
        <div className="receipt-header">Order Receipt</div>
        <div className="receipt-body">
          <div className="receipt-info-row">
            <span>Order #: <strong>{displayId}</strong></span>
            <span>Date: {new Date(createdAt).toLocaleDateString()}</span>
          </div>

          <div className="receipt-address">
            <strong>Delivery To:</strong>
            {shippingAddress.fullName}<br/>
            {shippingAddress.dorm !== 'Self Pickup' && <>{shippingAddress.dorm}<br/></>}
            {shippingAddress.phone}
          </div>

          <hr className="receipt-divider" />
          
          <strong>Items Ordered:</strong>
          <ul className="receipt-items-list">
            {orderItems.map((item, index) => (
              <li key={index} className="receipt-item">
                <span>{item.name}</span>
                {/* --- CURRENCY CHANGED TO BIRR --- */}
                <span>Birr {item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          
          <hr className="receipt-divider" />
          
          <ul className="receipt-summary-list">
            <li className="summary-item">
              <span>Subtotal</span>
              <span>Birr {itemsPrice.toFixed(2)}</span>
            </li>
            {serviceFee > 0 && (
              <li className="summary-item">
                <span>Service Fee</span>
                <span>Birr {serviceFee.toFixed(2)}</span>
              </li>
            )}
          </ul>
          
          <div className="receipt-total summary-item">
            <span>Total Paid</span>
            <span>Birr {totalPrice.toFixed(2)}</span>
          </div>
          
          <p className="receipt-footer-text">
            Thank you for using Campus Delivery!
          </p>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <button onClick={handleDownloadReceipt} className="confirmation-btn btn-download">
          Download Receipt
        </button>
        <Link to="/home" className="confirmation-btn btn-new-order">
          Start New Order
        </Link>
      </div>
    </div>
  );
}

export default ConfirmationPage;