import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';
// Import the final, corrected CSS
import './RestaurantAdminLayout.css';

const RestaurantAdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully.');
    navigate('/restaurant-admin/login');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return toast.error('New passwords do not match.');
    }
    const toastId = toast.loading('Updating password...');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
  `${API_BASE_URL}/api/users/profile/change-password`, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, config);
      toast.success('Password updated successfully!', { id: toastId });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.', { id: toastId });
    }
  };

  // Close sidebar when a nav link is clicked on mobile
  const handleNavLinkClick = () => { 
    if (isSidebarOpen) setSidebarOpen(false); 
  };

  // Close sidebar if window is resized to desktop width
  useEffect(() => {
    const handleResize = () => { 
      if (window.innerWidth > 992) setSidebarOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="ra-layout">
        {/* Backdrop for mobile menu */}
        <div 
          className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        <aside className={`ra-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="ra-sidebar-header">
            <div className="logo-icon"><i className="fas fa-store"></i></div>
            <h2>Restaurant Panel</h2>
          </div>
          <nav>
            <ul className="ra-nav-list">
              <li className="ra-nav-item"><NavLink to="/restaurant-admin/dashboard" className="ra-nav-link" onClick={handleNavLinkClick}><i className="fas fa-tachometer-alt ra-nav-icon"></i> Dashboard</NavLink></li>
              <li className="ra-nav-item"><NavLink to="/restaurant-admin/menu" className="ra-nav-link" onClick={handleNavLinkClick}><i className="fas fa-book-open ra-nav-icon"></i> Menu</NavLink></li>
              <li className="ra-nav-item"><NavLink to="/restaurant-admin/orders" className="ra-nav-link" onClick={handleNavLinkClick}><i className="fas fa-concierge-bell ra-nav-icon"></i> Orders</NavLink></li>
              <li className="ra-nav-item"><NavLink to="/restaurant-admin/reviews" className="ra-nav-link" onClick={handleNavLinkClick}><i className="fas fa-star-half-alt ra-nav-icon"></i> Reviews</NavLink></li>
            </ul>
          </nav>
        </aside>

        <div className="ra-main-content">
          <header className="ra-top-header">
            {/* Hamburger button for mobile */}
            <button className="ra-mobile-nav-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="ra-header-actions">
              <span className="ra-header-user">Welcome, <strong>{userInfo?.name || 'Admin'}</strong></span>
              <button className="ra-change-password-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
              <button className="ra-header-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          <main className="ra-page-content-wrapper">
            <Outlet />
          </main>
        </div>
      </div>

      {/* --- Full, Un-collapsed Password Change Modal --- */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">Change Your Password</h3>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <input 
                    type="password" 
                    name="currentPassword" 
                    className="form-input-custom" 
                    value={passwordData.currentPassword} 
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                    placeholder="Current Password" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="newPassword" 
                    className="form-input-custom" 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    placeholder="New Password" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="confirmNewPassword" 
                    className="form-input-custom" 
                    value={passwordData.confirmNewPassword} 
                    onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} 
                    placeholder="Confirm New Password" 
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-btn btn-secondary-custom">Cancel</button>
                <button type="submit" className="modal-btn btn-primary-custom">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantAdminLayout;