import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import Rating from '../../components/Rating'; // We'll reuse our Rating component

// Import the same CSS as your dashboard for consistent styling
import './RestaurantDashboard.css';

const RestaurantReviewsPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch the restaurant data, which now includes the 'reviews' array
  useEffect(() => {
    const fetchMyRestaurant = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) throw new Error('No login data found.');
        
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/api/restaurants/myrestaurant`, config);
        
        // Sort reviews to show the newest ones first
        if (data.reviews) {
          data.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setRestaurant(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRestaurant();
  }, []);
  
  // Reuse your existing loading and error components
  if (loading) {
    return <div className="ra-loader-container"><div className="ra-spinner"></div></div>;
  }
  if (error) {
    return <div className="ra-message-container"><p>{error}</p></div>;
  }
  if (!restaurant) {
    return <div className="ra-message-container"><p>Could not load restaurant data.</p></div>;
  }
  
  // 2. Render the new "My Reviews" page layout
  return (
    <div className="ra-dashboard-container">
      <div className="ra-dashboard-header">
        <h2>Customer Reviews</h2>
        <p>Here is the feedback your customers have provided.</p>
      </div>

      {/* --- Display the list of reviews --- */}
      <div className="ra-reviews-list">
        {restaurant.reviews && restaurant.reviews.length > 0 ? (
          restaurant.reviews.map(review => (
            <div key={review._id} className="ra-review-card">
              <div className="ra-review-header">
                <span className="ra-review-author">{review.name}</span>
                <Rating value={review.rating} />
              </div>
              <p className="ra-review-comment">{review.comment}</p>
              <div className="ra-review-footer">
                <span>{new Date(review.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="ra-message-container">
            <p>You have no reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviewsPage;