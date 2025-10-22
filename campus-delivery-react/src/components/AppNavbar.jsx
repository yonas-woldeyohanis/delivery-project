import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import './AppNavbar.css'; 
import API_BASE_URL from '../config';

function AppNavbar({ cartCount, userInfo, onLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const getFullImageUrl = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };
  
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`app-navbar ${isMobileMenuOpen ? 'menu-is-open' : ''}`}>
        <Link to={userInfo ? "/home" : "/"} className="navbar-brand" onClick={handleMobileLinkClick}>
          Aberus Service
        </Link>
        
        {/* --- DESKTOP NAVIGATION LINKS --- */}
        <div className="nav-links">
          {userInfo ? (
            <>
              <Link to="/home" className="nav-link">Home</Link>
              <Link to="/history" className="nav-link">Order History</Link>
              
              {/* --- THE FIX IS HERE: Link now correctly points to /cart --- */}
              <Link to="/cart" className="nav-link cart-link">
                Cart 
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              <button onClick={handleLogout} className="logout-button">Logout</button>
              <Link to="/profile" className="nav-user-avatar" title="My Profile">
                <img src={getFullImageUrl(userInfo.profilePicture)} alt={userInfo.name} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>

  {/* --- HAMBURGER/CLOSE ICON FOR MOBILE (using CSS toggle) --- */}
<button 
  className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`} 
  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
>
  <i className="fas fa-bars icon-hamburger"></i>
  <i className="fas fa-xmark icon-close"></i>
</button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`mobile-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        {userInfo ? (
          <>
          <Link to="/home" className="nav-link" onClick={handleMobileLinkClick}>Home</Link>
            <Link to="/profile" className="nav-link" onClick={handleMobileLinkClick}>My Profile</Link>
            <Link to="/history" className="nav-link" onClick={handleMobileLinkClick}>Order History</Link>
            
            {/* --- THE FIX IS ALSO HERE for the mobile menu --- */}
            <Link to="/cart" className="nav-link cart-link" onClick={handleMobileLinkClick}>
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={handleMobileLinkClick}>Login</Link>
            <Link to="/register" className="nav-link" onClick={handleMobileLinkClick}>Sign Up</Link>
          </>
        )}
      </div>
    </>
  );
}

export default AppNavbar;