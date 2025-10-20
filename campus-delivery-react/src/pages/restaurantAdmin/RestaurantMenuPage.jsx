import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';

// Import the shared CSS which includes our toggle switch styles
import './ManageRestaurantPages.css';

const RestaurantMenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState({ name: '', description: '', price: '', isAvailable: true });

  const getApiConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo.token}` }};
  };

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/restaurants/myrestaurant`, getApiConfig());
      setMenu(data.menu || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch menu. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMenu();
  }, []);

  const handleShowModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
    } else {
      setIsEditing(false);
      setCurrentItem({ name: '', description: '', price: '', isAvailable: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSaveItem = async () => {
    const url = isEditing ? `/api/restaurants/myrestaurant/menu/${currentItem._id}` : '/api/restaurants/myrestaurant/menu';
    const method = isEditing ? 'put' : 'post';
    const toastId = toast.loading(isEditing ? 'Updating item...' : 'Adding item...');
    try {
      await axios[method](url, currentItem, getApiConfig());
      toast.success('Menu updated!', { id: toastId });
      handleCloseModal();
      fetchMenu();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.', { id: toastId });
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      const toastId = toast.loading('Deleting item...');
      try {
       await axios.delete(`${API_BASE_URL}/api/restaurants/myrestaurant/menu/${itemId}`, getApiConfig());
        toast.success('Item deleted.', { id: toastId });
        fetchMenu();
      } catch (err) {
        toast.error('Failed to delete item.', { id: toastId });
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    setMenu(prevMenu => 
      prevMenu.map(menuItem => 
        menuItem._id === item._id ? { ...menuItem, isAvailable: !menuItem.isAvailable } : menuItem
      )
    );
    try {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      await axios.put(
  `${API_BASE_URL}/api/restaurants/myrestaurant/menu/${item._id}`, updatedItem, getApiConfig());
    } catch(err) {
      toast.error('Failed to update availability. Reverting change.');
      setMenu(prevMenu => 
        prevMenu.map(menuItem => 
          menuItem._id === item._id ? { ...menuItem, isAvailable: item.isAvailable } : menuItem
        )
      );
    }
  }

  if (loading) return <div className="ra-loader-container"><div className="ra-spinner"></div></div>;
  if (error) return <div className="ra-message-container">{error}</div>;

  return (
    <>
      <div className="ra-manage-page">
        <div className="ra-manage-header">
          <h2>Menu Management</h2> 
          <button className="ra-add-new-btn" onClick={() => handleShowModal()}>
            <i className="fas fa-plus"></i> Add New Item
          </button>
        </div>
        {menu.length === 0 ? (
          <div className="ra-message-container">Your menu is empty. Click "Add New Item" to get started.</div>
        ) : (
          <div className="ra-item-list">
            {menu.map((item) => (
              <div key={item._id} className="ra-item-card">
                <div className="ra-item-cell item-info">
                  <div className="label">Item</div>
                  <div className="value-name">{item.name}</div>
                  <div className="value-desc">{item.description}</div>
                </div>
                <div className="ra-item-cell item-price">
                  <div className="label">Price</div>
                  <div className="value-price">Birr {item.price.toFixed(2)}</div>
                </div>
                <div className="ra-item-cell item-avail">
                  <div className="label">Availability</div>
                  <label className="toggle-switch-label">
                    <input 
                      type="checkbox" 
                      checked={item.isAvailable} 
                      onChange={() => handleToggleAvailability(item)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="ra-item-actions">
                  <button className="ra-action-btn edit" onClick={() => handleShowModal(item)}>Edit</button>
                  <button className="ra-action-btn delete" onClick={() => handleDeleteItem(item._id, item.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add/Edit Item Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
              <div className="modal-header">
                <h3 className="modal-title">{isEditing ? 'Edit' : 'Add'} Menu Item</h3>
                <button type="button" onClick={handleCloseModal} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  {/* --- FIX #1: The onChange handler is now correct --- */}
                  <input 
                    type="text" 
                    placeholder="Item Name" 
                    className="form-input-custom" 
                    value={currentItem.name} 
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    placeholder="Description" 
                    className="form-input-custom" 
                    value={currentItem.description} 
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  {/* --- FIX #2: Added min="0" to prevent negative numbers --- */}
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="Price (in Birr)" 
                    className="form-input-custom" 
                    value={currentItem.price} 
                    onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="modal-btn btn-secondary-custom">Close</button>
                <button type="submit" className="modal-btn btn-primary-custom">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantMenuPage;