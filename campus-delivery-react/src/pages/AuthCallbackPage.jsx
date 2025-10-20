import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallbackPage = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        // Create the userInfo object in the format our app expects
        const userInfo = { ...user, token };
        
        toast.success(`Welcome, ${user.name}!`);
        // Use the main login handler from App.jsx to set the global state
        onLogin(userInfo);
        
        // Redirect to the home page, cleaning the URL of the token
        navigate('/home', { replace: true });
      } catch (e) {
        toast.error("Login failed. Could not process user data.");
        navigate('/login', { replace: true });
      }
    } else {
      toast.error("Authentication failed. Please try again.");
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, onLogin]);

  // Display a simple loading message to the user
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      <h2>Please wait, completing login...</h2>
    </div>
  );
};

export default AuthCallbackPage;