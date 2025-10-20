import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config';

import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password }, config);
      if (data && data.role === 'customer') {
        toast.success(`Welcome back, ${data.name}!`);
        onLogin(data);
        navigate('/home');
      } else {
        throw new Error('This is the customer login. Please use your dedicated admin portal.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred during login.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-custom">
        <div className="login-header">Customer Login</div>
        <div className="login-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group-login">
              <label htmlFor="email" className="form-label-login">Email address</label>
              <input type="email" id="email" className="form-input-login" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group-login">
              <label htmlFor="password" className="form-label-login">Password</label>
              <input type="password" id="password" className="form-input-login" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button-custom" disabled={loading}>
              {loading ? <div className="spinner-login"></div> : 'Login'}
            </button>
          </form>

          {/* --- THIS IS THE NEW PART --- */}
          <div className="social-login-divider">OR</div>
          <a href="http://localhost:5000/api/auth/google" className="google-btn">
            {/* Make sure you have a google-icon.svg in your /public folder */}
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google icon" /> 
            Continue with Google
          </a>
        </div>
        <div className="login-footer">
          <div>
            New Customer? <Link to="/register" className="login-footer-link">Sign Up Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;