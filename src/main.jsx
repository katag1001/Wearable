import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureCore } from '@core/config.js';
import App from './App';
import { URL } from './config';

// Hands core/ (shared with the phone app) the website's API URL and storage
// before anything uses it. The website no longer uploads photos.
configureCore({
  apiUrl: URL,
  storage: localStorage,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
