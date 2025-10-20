// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>
        {/* The "secret" link is on the copyright symbol */}
        <Link to="/portal" className="footer-link" >©</Link> 
        {` ${currentYear} Campus Delivery. All Rights `}   <Link to="/" className="footer-link" >Reserved.</Link> 
      </p>
    </footer>
  );
};

export default Footer;