// src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';

function CartPage({ cart, handleRemoveFromCart }) {
  const totalCost = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="page-title-cart">Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart-message-cart">
            <p>Your cart is currently empty.</p>
            <Link to="/home">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* --- Left Column: Cart Items --- */}
            <div className="cart-items-card">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div>
                    <p className="item-name-cart">{item.name}</p>
                    <p className="item-price-cart">Birr {item.price.toFixed(2)}</p>
                  </div>
                  <button className="remove-item-btn-cart" onClick={() => handleRemoveFromCart(index)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* --- Right Column: Order Summary --- */}
            <div className="cart-summary">
              <div className="summary-card-cart">
                <h2>Summary</h2>
                <div className="summary-total-cart">
                  <span>Total</span>
                  <span>Birr {totalCost.toFixed(2)}</span>
                </div>
                {/* This link correctly starts the checkout flow */}
                <Link to="/select-agent" className="checkout-btn-cart">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;