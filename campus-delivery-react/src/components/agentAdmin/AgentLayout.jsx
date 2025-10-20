import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../../config';
import './AgentLayout.css';

const AgentLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- 1. ADDED STATE AND HANDLERS FOR PASSWORD MODAL ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully.');
    navigate('/agent-admin/login');
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

  const handleNavLinkClick = () => { if (isSidebarOpen) setSidebarOpen(false); };
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 992) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="agent-layout">
        <aside className={`agent-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="agent-sidebar-header">
            <div className="logo-icon"><i className="fas fa-motorcycle"></i></div>
            <h2>Agent Portal</h2>
          </div>
          <nav>
            <ul className="agent-nav-list">
              <li className="agent-nav-item"><NavLink to="/agent-admin/dashboard" className="agent-nav-link" onClick={handleNavLinkClick}><i className="fas fa-th-large agent-nav-icon"></i> Available Jobs</NavLink></li>
              <li className="agent-nav-item"><NavLink to="/agent-admin/deliveries" className="agent-nav-link" onClick={handleNavLinkClick}><i className="fas fa-box-check agent-nav-icon"></i> My Deliveries</NavLink></li>
              {/* --- 2. ADDED PROFILE LINK TO SIDEBAR --- */}
              <li className="agent-nav-item"><NavLink to="/agent-admin/profile" className="agent-nav-link" onClick={handleNavLinkClick}><i className="fas fa-user-circle agent-nav-icon"></i> My Profile</NavLink></li>
            </ul>
          </nav>
        </aside>

        <div className="agent-main-content">
          <header className="agent-top-header">
            <button className="agent-mobile-nav-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}><i className="fas fa-bars"></i></button>
            <div className="agent-header-actions">
              <span className="agent-header-user">Welcome, <strong>{userInfo?.name || 'Agent'}</strong></span>
              {/* --- 3. ADDED CHANGE PASSWORD BUTTON TO HEADER --- */}
              <button className="agent-change-password-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
              <button className="agent-header-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          <main className="agent-page-content-wrapper"><Outlet /></main>
        </div>
      </div>

      {/* --- 4. ADDED PASSWORD CHANGE MODAL JSX --- */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-header"><h3 className="modal-title">Change Your Password</h3><button type="button" onClick={() => setShowPasswordModal(false)} className="modal-close-btn">&times;</button></div>
              <div className="modal-body">
                <div className="form-group"><input type="password" name="currentPassword" className="form-input-custom" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} placeholder="Current Password" required /></div>
                <div className="form-group"><input type="password" name="newPassword" className="form-input-custom" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="New Password" required /></div>
                <div className="form-group"><input type="password" name="confirmNewPassword" className="form-input-custom" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} placeholder="Confirm New Password" required /></div>
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

export default AgentLayout;