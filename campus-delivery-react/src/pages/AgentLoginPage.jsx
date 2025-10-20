import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- 1. IMPORT TOAST ---

// --- 2. IMPORT OUR NEW CSS ---
import './AgentLoginPage.css';

const AgentLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Your redirect logic is perfect and remains.
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.role === 'agent') {
      navigate('/agent-admin/dashboard');
    }
  }, [navigate]);

  // Submit handler is updated to use toasts.
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users/login', { email, password }, config);

      if (data && data.role === 'agent') {
        toast.success(`Welcome back, ${data.name}!`);
        onLogin(data);
        navigate('/agent-admin/dashboard');
      } else {
        throw new Error('Access Denied: Not an authorized agent account.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-login-page">
      <div className="agent-login-card">
        <div className="agent-login-header">
          <div className="icon"><i className="fas fa-motorcycle"></i></div>
          <h1>Agent Login</h1>
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-group-agent">
            <label htmlFor="email" className="form-label-agent">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input-agent"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-agent">
            <label htmlFor="password" className="form-label-agent">Password</label>
            <input
              type="password"
              id="password"
              className="form-input-agent"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="agent-login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
      <Link to="/" className="agent-footer-link">Back to Main Site</Link>
    </div>
  );
};

export default AgentLoginPage;