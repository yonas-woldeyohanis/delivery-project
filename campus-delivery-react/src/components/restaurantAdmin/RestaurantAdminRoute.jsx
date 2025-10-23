// src/components/restaurantAdmin/RestaurantAdminRoute.jsx

import React from 'react';
// --- 1. IMPORT 'Outlet' in addition to 'Navigate' ---
import { Navigate, Outlet } from 'react-router-dom';


// --- 2. The 'children' prop is no longer needed ---
const RestaurantAdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.role === 'restaurantAdmin') {
    return <Outlet />;
  }
  
  return <Navigate to="/restaurant-admin/login" replace />;
};

export default RestaurantAdminRoute;