import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// This is the root file for your React application.
// By removing the <React.StrictMode> component that was wrapping <BrowserRouter>,
// we are telling React to only render components once in development,
// which solves the double-popup and double-API-call issue.

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);