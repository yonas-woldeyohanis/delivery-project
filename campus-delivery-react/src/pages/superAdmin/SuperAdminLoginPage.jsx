import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- 1. IMPORT TOAST ---

// --- 2. IMPORT THE NEW DEDICATED CSS ---
import './SuperAdminLoginPage.css';

function SuperAdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Your handleSubmit logic is preserved and improved with toasts.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      
      // --- 3. SERVER-SIDE VALIDATION ---
      // The logic correctly checks if the user returned by the API is an admin.
      if (data && data.isAdmin) {
        toast.success('Authentication successful. Access granted.');
        onLogin(data);
        navigate('/super-admin/dashboard');
      } else {
        // This handles cases where a non-admin user might have correct credentials
        throw new Error('Access Denied. This portal is for Super Admins only.');
      }

    } catch (err) {
      // --- 4. USE TOAST FOR ALL ERRORS ---
      const message = err.response?.data?.message || err.message || 'Login failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <i className="fas fa-user-shield header-icon"></i>
          Super Admin Portal
        </div>
        <div className="admin-login-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group-admin">
              <input 
                type="email" 
                id="email"
                className="form-input-admin" 
                placeholder="Admin Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <i className="fas fa-envelope input-icon"></i>
            </div>

            <div className="form-group-admin">
              <input 
                type="password" 
                id="password"
                className="form-input-admin" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <i className="fas fa-lock input-icon"></i>
            </div>
            
            <button type="submit" className="admin-login-button" disabled={loading}>
              {loading ? <div className="spinner-admin"></div> : 'Login Securely'}
            </button>
            
          </form>
          
          
        </div>
        
      </div>
      
      
    </div>
    
  );
}

export default SuperAdminLoginPage;