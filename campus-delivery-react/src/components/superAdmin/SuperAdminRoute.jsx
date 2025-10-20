// src/components/superAdmin/SuperAdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.isAdmin) {
    return <Outlet />;
  }
  
  return <Navigate to="/super-admin/login" replace />;
};

export default SuperAdminRoute;