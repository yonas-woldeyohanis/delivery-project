import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AgentRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // This logic is simple and powerful:
  // If you have the right credentials, you see the page.
  if (userInfo && userInfo.role === 'agent') {
    return <Outlet />;
  }

  // Otherwise, for any other reason, you are sent to the login page.
  return <Navigate to="/agent-admin/login" replace />;
};

export default AgentRoute;