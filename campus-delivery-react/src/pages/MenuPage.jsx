import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 

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

const MenuPage = ({ handleAddToCart }) => { // Assuming you pass handleAddToCart as a prop
  const [restaurant, setRestaurant] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- FIX #1: Use 'id' to match the route parameter in App.jsx ---
  const { id } = useParams(); 

  useEffect(() => {
    const fetchRestaurantMenu = async () => {
      // The check from my previous code was correct, it just needs to use 'id'
      if (!id) {
        setError("No restaurant ID provided.");
        setLoading(false);
        return;
      }
      
      try {
        // --- FIX #2: Use 'id' in the API call URL ---
        const { data } = await axios.get(`${API_BASE_URL}/api/restaurants/${id}/public`);
        setRestaurant(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not fetch restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantMenu();
  // --- FIX #3: The dependency array must also use 'id' ---
  }, [id]); 

  // Dummy function if not provided - replace with your cart logic
  const onAddToCart = (item) => {
    console.log("Added to cart:", item);
    alert(`${item.name} added to cart!`);
  };
  const addToCartHandler = handleAddToCart || onAddToCart;


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
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCartHandler({ 
                      ...item,
                      restaurantId: id // Pass the correct 'id'
                    })}
                  >
                    Add
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
  {/* The link now goes to the correct page */}
  <Link to="/select-agent" className="checkout-btn">
    {/* The text is now updated */}
    Select Delivery Agent
  </Link>
</div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;