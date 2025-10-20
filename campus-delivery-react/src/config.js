// src/config.js

// This line reads the environment variable from Netlify (when deployed)
// OR falls back to your local server URL when running on your own machine.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;