import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 
import Rating from '../components/Rating'; // NEW: Import the Rating component

import './HomePage.css';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className="restaurant-grid">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map(restaurant => (
                <div key={restaurant._id} className="restaurant-card-custom">
                  <img src={restaurant.logo || restaurant.image} alt={restaurant.name} className="card-img-custom" />
                  <div className="card-body-custom">
                    <h3 className="card-title-custom">{restaurant.name}</h3>
                    <p className="card-text-custom">{restaurant.cuisine}</p>
                    
                    {/* UPDATED: Add the Rating component here */}
                    <div className="card-rating">
                      <Rating 
                        value={restaurant.rating} 
                        text={`${restaurant.numReviews} review${restaurant.numReviews !== 1 ? 's' : ''}`} 
                      />
                    </div>
                    
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