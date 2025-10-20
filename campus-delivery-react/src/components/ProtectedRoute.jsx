import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Get user info from local storage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Check if a user is logged in. 
  // We also check that they are a 'customer' or an 'agent' to be safe, 
  // as admins have their own portals.
// AFTER (This is more specific and secure)
if (userInfo && userInfo.role === 'customer') {
  return <Outlet />;
} else {
  return <Navigate to="/login" replace />;
}
};

export default ProtectedRoute;