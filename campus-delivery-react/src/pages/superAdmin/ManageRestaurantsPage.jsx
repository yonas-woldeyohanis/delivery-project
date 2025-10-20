import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';
import './ManageAdminPages.css';

function ManageRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    restaurantName: '', cuisine: '', adminName: '', adminEmail: '', adminPassword: '',
  });
  const [logoFile, setLogoFile] = useState(null);

  const getApiConfig = (isFormData = false) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      toast.error("Authorization failed. Please log in again.");
      return {};
    }
    const headers = { Authorization: `Bearer ${userInfo.token}` };
    if (isFormData) headers['Content-Type'] = 'multipart/form-data';
    return { headers };
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      // --- THIS IS THE FIX ---
      // The API endpoint is simply '/api/restaurants'.
      // This is a public route to get all restaurants, which is fine for the admin to use as well.
      const { data } = await axios.get(`${API_BASE_URL}/api/restaurants`, getApiConfig());
      setRestaurants(data);
    } catch (err) {
      console.error("API Fetch Error:", err);
      const message = err.response?.data?.message || 'Could not fetch restaurants.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // All other handler functions are correct and remain unchanged.
  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => {
    setShowModal(false);
    setFormData({ restaurantName: '', cuisine: '', adminName: '', adminEmail: '', adminPassword: '' });
    setLogoFile(null);
  };
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setLogoFile(e.target.files[0]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Creating restaurant...');
    const uploadData = new FormData();
    // Use the correct form field names from your backend
    uploadData.append('name', formData.restaurantName); 
    uploadData.append('cuisine', formData.cuisine);
    uploadData.append('adminName', formData.adminName);
    uploadData.append('adminEmail', formData.adminEmail);
    uploadData.append('password', formData.adminPassword);
    if (logoFile) {
        uploadData.append('logo', logoFile);
    }

    try {
      // NOTE: Ensure your POST route matches this in the backend
      await axios.post('/api/restaurants', uploadData, getApiConfig(true));
      toast.success('Restaurant created successfully!', { id: toastId });
      handleCloseAddModal();
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create restaurant.', { id: toastId });
    }
  };

  const handleDelete = (restaurantId, restaurantName) => {
    setRestaurantToDelete({ id: restaurantId, name: restaurantName });
    setConfirmModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!restaurantToDelete) return;
    const toastId = toast.loading(`Deleting ${restaurantToDelete.name}...`);
    try {
      // NOTE: Ensure your DELETE route matches this in the backend
      await axios.delete(`${API_BASE_URL}/api/restaurants/${restaurantToDelete.id}`, getApiConfig());
      toast.success(`"${restaurantToDelete.name}" deleted successfully.`, { id: toastId });
      fetchRestaurants();
    } catch (err) {
      toast.error('Failed to delete restaurant.', { id: toastId });
    } finally {
      setConfirmModalOpen(false);
      setRestaurantToDelete(null);
    }
  };

  return (
    <>
      <div className="manage-page-container">
        <div className="manage-page-header">
          <h1>Manage Restaurants</h1>
          <button className="add-new-btn" onClick={handleShowAddModal}>
            <i className="fas fa-plus"></i> Add New
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && !loading && <div className="error-message" style={{color: '#ef4444'}}>{error}</div>}
        {!loading && !error && (
          <div className="item-list-admin">
            {restaurants.length === 0 ? (
                <p>No restaurants found. Click "Add New" to create one.</p>
            ) : (
                restaurants.map(restaurant => (
                <div key={restaurant._id} className="item-row-card">
                    <div className="item-cell-admin item-logo">
                    <img src={restaurant.logo} alt={`${restaurant.name} logo`} />
                    </div>
                    <div className="item-cell-admin">
                    <div className="label">Name</div>
                    <div className="value"><strong>{restaurant.name}</strong></div>
                    </div>
                    <div className="item-cell-admin">
                    <div className="label">Cuisine</div>
                    <div className="value">{restaurant.cuisine}</div>
                    </div>
                    <div className="item-cell-admin item-actions">
                    <button className="delete-btn" onClick={() => handleDelete(restaurant._id, restaurant.name)}>
                        Delete
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* "Add New Restaurant" Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseAddModal}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Restaurant</h3>
                <button type="button" onClick={handleCloseAddModal} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <h4>Restaurant Details</h4>
                <div className="modal-form-grid">
                  <div className="form-group"><input type="text" name="restaurantName" placeholder="Restaurant Name" className="form-input-custom" value={formData.restaurantName} onChange={handleFormChange} required /></div>
                  <div className="form-group"><input type="text" name="cuisine" placeholder="Cuisine Type" className="form-input-custom" value={formData.cuisine} onChange={handleFormChange} /></div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label-custom">Restaurant Logo</label>
                  <input type="file" name="logo" className="form-input-custom" onChange={handleFileChange} accept="image/*" />
                </div>
                <hr style={{margin: '2rem 0', borderColor: '#374151'}} />
                <h4>Admin User Account</h4>
                <div className="modal-form-grid">
                  <div className="form-group"><input type="text" name="adminName" placeholder="Admin's Full Name" className="form-input-custom" value={formData.adminName} onChange={handleFormChange} required /></div>
                  <div className="form-group"><input type="email" name="adminEmail" placeholder="Admin's Email" className="form-input-custom" value={formData.adminEmail} onChange={handleFormChange} required /></div>
                </div>
                <div className="form-group full-width"><input type="password" name="adminPassword" placeholder="Temporary Password for Admin" className="form-input-custom" value={formData.adminPassword} onChange={handleFormChange} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseAddModal} className="modal-btn btn-secondary-custom">Cancel</button>
                <button type="submit" className="modal-btn btn-primary-custom">Create Restaurant & User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                  <h3 className="modal-title">Confirm Deletion</h3>
              </div>
              <div className="modal-body">
                  <p>Are you sure you want to delete "<strong>{restaurantToDelete?.name}</strong>"? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                  <button type="button" onClick={() => setConfirmModalOpen(false)} className="modal-btn btn-secondary-custom">Cancel</button>
                  <button type="button" onClick={confirmDelete} className="modal-btn btn-danger-custom" style={{backgroundColor: '#dc2626', color: 'white'}}>Delete</button>
              </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageRestaurantsPage;