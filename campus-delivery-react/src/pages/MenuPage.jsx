import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 
import toast from 'react-hot-toast'; // NEW: Import toast

import './MenuPage.css'; 

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
  const [addedItemId, setAddedItemId] = useState(null); // NEW: State to track the recently added item
  
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
  
  // UPDATED: New handler to provide UI feedback
  const onAddItem = (item) => {
    // 1. Call the original cart logic
    handleAddToCart({ ...item, restaurantId: id });
    
    // 2. Show a success toast
    toast.success(`"${item.name}" added to cart!`);

    // 3. Trigger the button's visual change
    setAddedItemId(item._id);

    // 4. Revert the button back to normal after 1.5 seconds
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
        <p className="restaurant-cuisine">{restaurant.cuisine}</p>
      </header>

      <main className="menu-content">
        <h2 className="menu-section-title">Full Menu</h2>
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
                  {/* UPDATED: The button now uses the new state and handler */}
                  <button
                    className={`add-to-cart-btn ${addedItemId === item._id ? 'added' : ''}`}
                    onClick={() => onAddItem(item)}
                    disabled={addedItemId === item._id} // Prevent spam clicking
                  >
                    {addedItemId === item._id ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-menu-message">
              <p>This restaurant has not added any menu items yet.</p>
            </div>
          )}
        </div>
        
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