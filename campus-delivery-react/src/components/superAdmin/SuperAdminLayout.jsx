import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [isNavOpen, setNavOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    if (isNavOpen) setNavOpen(false);
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully.');
    navigate('/super-admin/login');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    const toastId = toast.loading('Updating password...');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
     await axios.put(
  `${API_BASE_URL}/api/users/profile/change-password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        config
      );
      toast.success('Password updated successfully!', { id: toastId });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.', { id: toastId });
    }
  };

  const handleNavLinkClick = () => {
    if (isNavOpen) setNavOpen(false);
  };
  
  const openPasswordModal = () => {
    if (isNavOpen) setNavOpen(false);
    setShowPasswordModal(true);
  };

  return (
    <>
      <div className="super-admin-layout">
        <header className="main-navbar">
          <div className="navbar-left-section">
            <div className="navbar-brand">
              <NavLink to="/super-admin/dashboard">Super Admin</NavLink>
            </div>
            <nav className="desktop-nav">
              <NavLink to="/super-admin/dashboard" className="nav-link">Dashboard</NavLink>
              <NavLink to="/super-admin/restaurants" className="nav-link">Restaurants</NavLink>
              <NavLink to="/super-admin/agents" className="nav-link">Agents</NavLink>
              <NavLink to="/super-admin/orders" className="nav-link">All Orders</NavLink>
            </nav>
          </div>
          
          <div className="navbar-user-actions">
            <span className="navbar-user-welcome">Welcome, <strong>{userInfo?.name || 'Admin'}</strong></span>
            <button className="nav-action-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
            <button className="nav-action-btn logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <button className="navbar-toggle" onClick={() => setNavOpen(!isNavOpen)}>
            <i className={isNavOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
          
          <nav className={`mobile-nav-menu ${isNavOpen ? 'open' : ''}`}>
            {/* Main links */}
            <NavLink to="/super-admin/dashboard" className="nav-link" onClick={handleNavLinkClick}>Dashboard</NavLink>
            <NavLink to="/super-admin/restaurants" className="nav-link" onClick={handleNavLinkClick}>Restaurants</NavLink>
            <NavLink to="/super-admin/agents" className="nav-link" onClick={handleNavLinkClick}>Agents</NavLink>
            <NavLink to="/super-admin/orders" className="nav-link" onClick={handleNavLinkClick}>All Orders</NavLink>
            
            <div className="mobile-nav-divider"></div>
            
            {/* User actions for mobile */}
            <button className="nav-action-btn mobile-only-btn" onClick={openPasswordModal}>Change Password</button>
            <button className="nav-action-btn mobile-only-btn logout-btn" onClick={handleLogout}>Logout</button>
          </nav>
        </header>

        <main className="admin-page-content-wrapper">
          <Outlet />
        </main>
      </div>

      {/* Password Change Modal */}
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
                        <input type="password" name="currentPassword" className="form-input-custom" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Current Password" required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="newPassword" className="form-input-custom" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="New Password" required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="confirmNewPassword" className="form-input-custom" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })} placeholder="Confirm New Password" required />
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

export default SuperAdminLayout;