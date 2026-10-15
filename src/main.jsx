import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureCore } from '@core/config.js';
import App from './App';
import { URL } from './config';

// Hands core/ the web's API URL, storage and Cloudinary account before
// anything uses it (context/mobile-app-plan.md).
configureCore({
  apiUrl: URL,
  storage: localStorage,
  cloudName: import.meta.env.VITE_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_UPLOAD_PRESET,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
