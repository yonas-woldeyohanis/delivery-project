import React,  { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import './MyProfilePage.css';
import  API_BASE_URL  from '../config';

const MyProfilePage = ({ userInfo, onUpdate }) => {
  // State for profile form
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const getFullImageUrl = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  const [imagePreview, setImagePreview] = useState(
    getFullImageUrl(userInfo?.profilePicture) || '/images/default-avatar.png'
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Profile update submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating profile...');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (imageFile) {
      formData.append('profilePicture', imageFile);
    }

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(
  `${API_BASE_URL}/api/users/profile`, formData, config);
      onUpdate(data);
      setImagePreview(getFullImageUrl(data.profilePicture));
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Password submit handler
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

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-layout">
            {/* --- Left Column: Picture --- */}
            <div className="profile-picture-section">
              <div className="profile-image-wrapper">
                <img src={imagePreview} alt="Profile Preview" className="profile-image" />
              </div>
              <label htmlFor="profilePictureInput" className="profile-image-upload-label">
                Upload New Picture
              </label>
              <input id="profilePictureInput" type="file" onChange={handleImageChange} accept="image/*" />
            </div>

            {/* --- Right Column: Form --- */}
            <div className="profile-form-section">
              <h2>Account Details</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group-custom">
                  <label htmlFor="name" className="form-label-custom">Full Name</label>
                  <input type="text" id="name" className="form-input-custom" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group-custom">
                  <label htmlFor="email" className="form-label-custom">Email Address</label>
                  <input type="email" id="email" className="form-input-custom" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="profile-actions">
                  <button type="submit" className="profile-btn btn-update" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button type="button" className="profile-btn btn-change-password" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- Password Change Modal --- */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">Change Password</h3>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-close-btn">&times;</button>
              </div>
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

export default MyProfilePage;