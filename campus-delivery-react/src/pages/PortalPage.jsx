// src/pages/PortalPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './PortalPage.css';

const PortalPage = () => {
  return (
    <div className="portal-page">
      <div className="portal-container">
        <h1 className="portal-title">Admin Portals</h1>
        <div className="portal-links">
          <Link to="/super-admin/login" className="portal-link-btn super-admin">
            Super Admin Login
          </Link>
          <Link to="/restaurant-admin/login" className="portal-link-btn restaurant-admin">
            Restaurant Admin Login
          </Link>
          <Link to="/agent-admin/login" className="portal-link-btn agent">
            Agent Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;