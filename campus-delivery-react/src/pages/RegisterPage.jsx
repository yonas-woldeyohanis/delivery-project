import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config.js';

import './RegisterPage.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Creating your account...');
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      await axios.post(`${API_BASE_URL}/api/users/register`, { name, email, password }, config);
      toast.success('Registration successful! Please log in.', { id: toastId });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred during registration.';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card-custom">
        <div className="register-header">Create Account</div>
        <div className="register-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group-register">
              <label htmlFor="name" className="form-label-register">Full Name</label>
              <input type="text" id="name" className="form-input-register" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group-register">
              <label htmlFor="email" className="form-label-register">Email address</label>
              <input type="email" id="email" className="form-input-register" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group-register">
              <label htmlFor="password" className="form-label-register">Password</label>
              <input type="password" id="password" className="form-input-register" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group-register">
              <label htmlFor="confirmPassword" className="form-label-register">Confirm Password</label>
              <input type="password" id="confirmPassword" className="form-input-register" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="register-button-custom" disabled={loading}>
              {loading ? <div className="spinner-register"></div> : 'Sign Up'}
            </button>
          </form>

          {/* --- THIS IS THE NEW PART --- */}
          <div className="social-login-divider">OR</div>
          <a href="http://localhost:5000/api/auth/google" className="google-btn">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google icon" />
            Continue with Google
          </a>
        </div>
        <div className="register-footer">
          Already have an account? <Link to="/login" className="register-footer-link">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;