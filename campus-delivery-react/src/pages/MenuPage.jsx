import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 

// --- Import your CSS for this page ---
import './MenuPage.css'; 

// A simple placeholder for an error message component
const ErrorMessage = ({ message }) => (
  <div className="menu-page-wrapper">
    <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  </div>
);

// A simple placeholder for a loading spinner component
const LoadingSpinner = () => (
    <div className="menu-page-wrapper">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="spinner-menu"></div> {/* You can style this spinner in MenuPage.css */}
        </div>
    </div>
);


const MenuPage = () => {
  // --- STATE MANAGEMENT ---
  // Initialize restaurant as 'null' to prevent the '.map' error
  const [restaurant, setRestaurant] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { restaurantId } = useParams(); // Get the restaurant ID from the URL

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchRestaurantMenu = async () => {
      // Ensure we don't run this without an ID
      if (!restaurantId) {
        setError("No restaurant ID provided.");
        setLoading(false);
        return;
      }
      
      try {
        // We assume your back-end has a public route to get a single restaurant's details
        const { data } = await axios.get(`${API_BASE_URL}/api/restaurants/${restaurantId}/public`);
        setRestaurant(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not fetch restaurant details.");
      } finally {
        // This runs whether the request succeeds or fails
        setLoading(false);
      }
    };

    fetchRestaurantMenu();
  }, [restaurantId]); // Re-run the effect if the restaurantId changes

  // Dummy function for adding to cart - replace with your actual cart logic
  const handleAddToCart = (item) => {
    console.log("Added to cart:", item);
    // Here you would typically dispatch an action to your cart context/state
    alert(`${item.name} added to cart!`);
  };


  // --- CONDITIONAL RENDERING ---

  // 1. Show a loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. Show an error message if the API call failed
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 3. Show a different error if the API succeeded but returned no restaurant
  if (!restaurant) {
    return <ErrorMessage message="Restaurant data not found." />;
  }

  // 4. If everything is successful, render the full menu page
  return (
    <div className="menu-page-wrapper">
      <header 
        className="restaurant-header" 
        style={{ backgroundImage: `url(${restaurant.logo})` }}
      >
        <div className="header-overlay"></div> {/* Adds a dark overlay for text readability */}
        <h1 className="restaurant-title">{restaurant.name}</h1>
        <p className="restaurant-cuisine">{restaurant.cuisine}</p>
      </header>

      <main className="menu-content">
        <h2 className="menu-section-title">Full Menu</h2>
        <div className="menu-list">
          {/* --- THIS IS THE CRITICAL SAFETY CHECK --- */}
          {/* First check if restaurant.menu exists and if it has items */}
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
                    onClick={() => handleAddToCart({ 
                      ...item,
                      restaurantId: restaurantId 
                    })}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            // If there are no menu items, show a helpful message
            <div className="empty-menu-message">
              <p>This restaurant has not added any menu items yet.</p>
            </div>
          )}
        </div>
        
        {/* Only show the checkout button if there are items in the menu */}
        {restaurant.menu && restaurant.menu.length > 0 && (
          <div className="checkout-button-wrapper">
            <Link to="/cart" className="checkout-btn">
              Go to Cart
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;