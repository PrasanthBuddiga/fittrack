// config.js

const ENVIRONMENTS = {
  '127.0.0.1:5500': 'http://localhost:3000',     // dev
  'qa.yoursite.com': 'https://qa-api.yoursite.com',     // QA
  'prod.yoursite.com': 'https://api.yoursite.com',      // Prod
  'prasanthbuddiga.github.io': 'https://fittrack-udjm.onrender.com' // GitHub Pages
};

// Use hostname to map to correct backend URL
export const API_BASE_URL = ENVIRONMENTS[window.location.host] || 'http://localhost:3000';
