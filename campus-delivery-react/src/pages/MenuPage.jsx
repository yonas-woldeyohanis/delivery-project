import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// --- Import our new custom CSS ---
import './MenuPage.css';

function MenuPage({ handleAddToCart }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id: restaurantId } = useParams();

  // This data-fetching logic is perfect and remains unchanged.
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/restaurants/${restaurantId}`);
        setRestaurant(data);
      } catch (err) {
        setError('Could not fetch restaurant details. It may not exist or the server is down.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) {
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  const Loader = () => (
    <div className="loader-container-menu"><div className="spinner-menu"></div></div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="menu-page-wrapper"><p className="alert-menu">{message}</p></div>
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="menu-page-wrapper">
      {restaurant ? (
        <>
          <header 
            className="restaurant-header" 
            style={{ backgroundImage: `url(${restaurant.logo || restaurant.image})` }}
          >
            <h1 className="restaurant-title">{restaurant.name}</h1>
            <p className="restaurant-cuisine">{restaurant.cuisine}</p>
          </header>

          <main className="menu-content">
            <h2 className="menu-section-title">Full Menu</h2>
            <div className="menu-list">
              {restaurant.menu.map(item => (
                <div key={item._id} className="menu-item-card">
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                  </div>
                  <div className="item-actions">
                    <span className="item-price">Birr{item.price.toFixed(2)}</span>
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
              ))}
            </div>

            <div className="checkout-button-wrapper">
              <Link to="/select-agent" className="checkout-btn">
                Select Delivery Agent
              </Link>
            </div>
          </main>
        </>
      ) : (
        <ErrorMessage message="Restaurant data not found." />
      )}
    </div>
  );
}

export default MenuPage;