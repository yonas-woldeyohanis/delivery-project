import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config';

// --- 1. IMPORT THE SHARED CSS ---
import './ManageAdminPages.css';

function ManageAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // --- State for the modals ---
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const getApiConfig = (isFormData = false) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const headers = { Authorization: `Bearer ${userInfo.token}` };
    if (isFormData) headers['Content-Type'] = 'multipart/form-data';
    return { headers };
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/agents`, getApiConfig());
      setAgents(data);
      setError('');
    } catch (err) {
      setError('Could not fetch delivery agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', phone: '' });
    setProfilePhotoFile(null);
  };
  
  const handleShowModal = () => setShowModal(true);
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfilePhotoFile(e.target.files[0]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Creating new agent...');
    const uploadData = new FormData();
    Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
    if (profilePhotoFile) uploadData.append('profilePhoto', profilePhotoFile);

    try {
      await axios.post('/api/agents', uploadData, getApiConfig(true));
      toast.success('Agent created successfully!', { id: toastId });
      handleCloseModal();
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agent.', { id: toastId });
    }
  };
  
  const handleDelete = (agentId, agentName) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setConfirmModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!agentToDelete) return;
    const toastId = toast.loading('Deleting agent...');
    try {
      await axios.delete(`${API_BASE_URL}/api/agents/${agentToDelete.id}`, getApiConfig());
      toast.success(`"${agentToDelete.name}" deleted.`, { id: toastId });
      fetchAgents();
    } catch (err) {
      toast.error('Failed to delete agent.', { id: toastId });
    } finally {
      setConfirmModalOpen(false);
      setAgentToDelete(null);
    }
  };

  return (
    <>
      <div className="manage-page-container">
        <div className="manage-page-header">
          <h1>Manage Delivery Agents</h1>
          <button className="add-new-btn" onClick={handleShowModal}>
            <i className="fas fa-plus"></i> Add New Agent
          </button>
        </div>

        {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
          <div className="item-list-admin">
            {agents.map(agent => (
              <div key={agent._id} className="item-row-card" style={{gridTemplateColumns: '80px 2fr 2fr 2fr 1fr'}}>
                <div className="item-cell-admin item-logo">
                  <img src={agent.profilePicture} alt={agent.name} style={{borderRadius: '50%'}}/>
                </div>
                <div className="item-cell-admin">
                  <div className="label">Name</div>
                  <div className="value"><strong>{agent.name}</strong></div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">Email</div>
                  <div className="value">{agent.email}</div>
                </div>
                <div className="item-cell-admin">
                  <div className="label">Phone</div>
                  <div className="value">{agent.phone || 'N/A'}</div>
                </div>
                <div className="item-cell-admin item-actions">
                  <button className="delete-btn" onClick={() => handleDelete(agent._id, agent.name)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Add New Agent" Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Agent</h3>
                <button type="button" onClick={handleCloseModal} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group"><input type="text" name="name" placeholder="Agent's Full Name" className="form-input-custom" value={formData.name} onChange={handleFormChange} required /></div>
                <div className="form-group"><input type="email" name="email" placeholder="Agent's Email" className="form-input-custom" value={formData.email} onChange={handleFormChange} required /></div>
                <div className="form-group"><input type="password" name="password" placeholder="Temporary Password" className="form-input-custom" value={formData.password} onChange={handleFormChange} required /></div>
                <div className="form-group"><input type="tel" name="phone" placeholder="Phone Number (Optional)" className="form-input-custom" value={formData.phone} onChange={handleFormChange} /></div>
                <div className="form-group">
                  <label className="form-label-custom">Profile Photo</label>
                  <input type="file" name="profilePhoto" className="form-input-custom" onChange={handleFileChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="modal-btn btn-secondary-custom">Cancel</button>
                <button type="submit" className="modal-btn btn-primary-custom">Create Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting */}
      {isConfirmModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ justifyContent: 'center' }}><h3 className="modal-title">Confirm Deletion</h3></div>
            <div className="modal-body confirm-modal-body">
              <p>Are you sure you want to permanently delete</p>
              <p className="item-name">"{agentToDelete?.name}"?</p>
            </div>
            <div className="modal-footer confirm-modal-footer">
              <button type="button" onClick={() => setConfirmModalOpen(false)} className="modal-btn btn-secondary-custom">Cancel</button>
              <button type="button" onClick={confirmDelete} className="modal-btn btn-confirm-delete">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageAgentsPage;