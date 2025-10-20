import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 

import './HomePage.css';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. ADD NEW STATE FOR THE SEARCH TERM ---
  const [searchTerm, setSearchTerm] = useState('');

  // This data-fetching logic remains the same.
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/restaurants`);
        setRestaurants(data);
      } catch (err) {
        setError('Could not fetch restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // --- 2. CREATE A FILTERED LIST OF RESTAURANTS ---
  // This logic runs every time the component re-renders (e.g., when searchTerm changes).
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Loader = () => (
    <div className="loader-container">
      <div className="spinner-custom"></div>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="alert-custom">{message}</div>
  );

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 className="hero-title">Campus Eats, Delivered Fast</h1>
        <p className="hero-subtitle">
          Your favorite campus restaurants, right at your fingertips. Quick, easy, and convenient.
        </p>
      </section>

      <section className="restaurants-section">
        <div className="section-header">
          <h2 className="section-title">Nearby Restaurants</h2>
          {/* --- 3. ADD THE SEARCH BAR INPUT --- */}
          <div className="search-bar-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search by name or cuisine..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          // --- 4. RENDER THE FILTERED LIST ---
          // Also, add a message for when the filter returns no results.
          <div className="restaurant-grid">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map(restaurant => (
                <div key={restaurant._id} className="restaurant-card-custom">
                  <img src={restaurant.logo || restaurant.image} alt={restaurant.name} className="card-img-custom" />
                  <div className="card-body-custom">
                    <h3 className="card-title-custom">{restaurant.name}</h3>
                    <p className="card-text-custom">{restaurant.cuisine}</p>
                    <Link to={`/restaurant/${restaurant._id}`} className="card-button-custom">
                      View Menu
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results-message">No restaurants found matching your search.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;