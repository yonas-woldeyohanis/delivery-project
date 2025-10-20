import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 

// --- Import our new custom CSS ---
import './SelectAgentPage.css';

const SelectAgentPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // This logic is all perfect and remains unchanged.
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/agents`);
        setAgents(data);
      } catch (err) {
        setError('Could not fetch available delivery agents.');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleSelectAgent = (agent) => {
    navigate('/enter-delivery-info', {
      state: { selectedAgent: agent, deliveryType: 'delivery' }
    });
  };

  const handleSelectPickup = () => {
    navigate('/enter-pickup-info', {
      state: { selectedAgent: null, deliveryType: 'pickup' }
    });
  };

  const Loader = () => (
    <div className="loader-container-agent"><div className="spinner-agent"></div></div>
  );

  const ErrorMessage = ({ message }) => (
    <p className="alert-agent">{message}</p>
  );

  return (
    <div className="select-agent-page">
      <div className="page-header">
        <h1 className="page-title">Choose Your Delivery Method</h1>
        <p className="page-subtitle">Select a trusted agent or choose to pick up the order yourself.</p>
      </div>

      {/* --- New Pickup Card --- */}
      <div className="pickup-card" onClick={handleSelectPickup}>
        <h3>Don't need delivery?</h3>
        <button className="pickup-button">I'll Pick It Up Myself</button>
      </div>

      <h2 className="page-title" style={{textAlign: 'center', marginBottom: '3rem'}}>Or Select a Delivery Agent</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="agent-grid">
          {agents.map((agent) => (
            <div key={agent._id} className="agent-card-custom">
              <div className="agent-img-wrapper">
                <img 
                  src={agent.profilePicture} 
                  alt={agent.name} 
                  className="agent-img"
                />
              </div>
              <div className="agent-body">
                <h3 className="agent-name">{agent.name}</h3>
                <p className="agent-title">Campus Delivery Agent</p>
                <button 
                  className="agent-select-btn" 
                  onClick={() => handleSelectAgent(agent)}
                >
                  Select {agent.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectAgentPage;