import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- 1. IMPORT TOAST ---

// --- 2. IMPORT OUR NEW CSS ---
import './RestaurantAdminLoginPage.css';

function RestaurantAdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Your handleSubmit logic is excellent and preserved, but with toasts.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users/login', { email, password }, config);

      // --- 3. ROLE VALIDATION ---
      if (data.role !== 'restaurantAdmin') {
        // Use a more specific error for non-admins
        throw new Error('Access Denied. This portal is for Restaurant Admins only.');
      }

      toast.success(`Welcome back, ${data.name}!`);
      onLogin(data);
      navigate('/restaurant-admin/dashboard');

    } catch (err) {
      // --- 4. USE TOAST FOR ALL ERRORS ---
      const message = err.response?.data?.message || err.message || 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ra-login-page">
      <div className="ra-login-card">
        {/* --- Left Side: Branding --- */}
        <div className="ra-login-branding">
          <div className="branding-icon"><i className="fas fa-store"></i></div>
          <h2>Restaurant Portal</h2>
          <p>Manage your menu, track orders, and grow your business on campus.</p>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="ra-login-form-wrapper">
          <h3>Admin Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-ra">
              <label htmlFor="email" className="form-label-ra">Email Address</label>
              <input 
                type="email" 
                id="email"
                className="form-input-ra" 
                placeholder="your-admin@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group-ra">
              <label htmlFor="password" className="form-label-ra">Password</label>
              <input 
                type="password" 
                id="password"
                className="form-input-ra" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <button type="submit" className="ra-login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="ra-login-footer">
            Are you a customer? <Link to="/login" className="ra-login-footer-link">Click Here</Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default RestaurantAdminLoginPage;