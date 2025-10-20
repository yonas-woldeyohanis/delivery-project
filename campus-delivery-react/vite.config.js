// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite what port to run the frontend dev server on
    port: 5173, 
    proxy: {
      // This forwards any request starting with '/api' to your backend server
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true,
        secure: false,      
      },
    }
  }
});