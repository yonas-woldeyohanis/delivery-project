import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 
import toast from 'react-hot-toast';
import Rating from '../components/Rating'; // NEW: Import the Rating component

import './MenuPage.css'; 

// ... (ErrorMessage and LoadingSpinner components remain unchanged) ...
const ErrorMessage = ({ message }) => (
    <div className="menu-page-wrapper">
        <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
            <h2>Error</h2>
            <p>{message}</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="menu-page-wrapper">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="spinner-menu"></div>
        </div>
    </div>
);


const MenuPage = ({ handleAddToCart }) => {
  const [restaurant, setRestaurant] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItemId, setAddedItemId] = useState(null);
  
  const { id } = useParams(); 

  useEffect(() => {
    const fetchRestaurantMenu = async () => {
      if (!id) {
        setError("No restaurant ID provided.");
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/restaurants/${id}/public`);
        setRestaurant(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not fetch restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantMenu();
  }, [id]); 
  
  const onAddItem = (item) => {
    handleAddToCart({ ...item, restaurantId: id });
    toast.success(`"${item.name}" added to cart!`);
    setAddedItemId(item._id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 1500);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!restaurant) {
    return <ErrorMessage message="Restaurant data not found." />;
  }

  return (
    <div className="menu-page-wrapper">
      <header 
        className="restaurant-header" 
        style={{ backgroundImage: `url(${restaurant.logo})` }}
      >
        <div className="header-overlay"></div>
        <h1 className="restaurant-title">{restaurant.name}</h1>
        {/* UPDATED: Add average rating to the header */}
        <div className="restaurant-header-rating">
          <Rating 
            value={restaurant.rating} 
            text={`${restaurant.numReviews} review${restaurant.numReviews !== 1 ? 's' : ''}`}
          />
        </div>
      </header>

      <main className="menu-content">
        <h2 className="menu-section-title">Full Menu</h2>
        {/* ... (Menu list JSX remains unchanged) ... */}
        <div className="menu-list">
          {restaurant.menu && restaurant.menu.length > 0 ? (
            restaurant.menu.map(item => (
              <div key={item._id} className="menu-item-card">
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                </div>
                <div className="item-actions">
                  <span className="item-price">Birr {item.price.toFixed(2)}</span>
                  <button
                    className={`add-to-cart-btn ${addedItemId === item._id ? 'added' : ''}`}
                    onClick={() => onAddItem(item)}
                    disabled={addedItemId === item._id}
                  >
                    {addedItemId === item._id ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-menu-message"><p>This restaurant has not added any menu items yet.</p></div>
          )}
        </div>
        
        {/* --- NEW: Reviews Section --- */}
        <div className="reviews-section">
          <h2 className="menu-section-title">Reviews</h2>
          {restaurant.reviews && restaurant.reviews.length > 0 ? (
            <div className="reviews-list">
              {restaurant.reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-reviews-message">
              <p>No reviews yet. Be the first to leave one!</p>
            </div>
          )}
        </div>
        
        {/* ... (Checkout button remains unchanged) ... */}
        {restaurant.menu && restaurant.menu.length > 0 && (
          <div className="checkout-button-wrapper">
            <Link to="/select-agent" className="checkout-btn">
              Select Delivery Agent
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;