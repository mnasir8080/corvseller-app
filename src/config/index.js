// src/config/index.js
const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
API_BASE_URL: isDevelopment 
  ? 'http://localhost:9000/apix/'
  : 'https://corvseller.com/apix/',

// Add other configuration variables as needed
// WEBSOCKET_URL: isDevelopment
//   ? 'ws://localhost:9000'
//   : 'wss://corvseller.com',

// DEBUG: isDevelopment,

// Version info
// VERSION: process.env.npm_package_version || '1.0.0',

// Add any other environment-specific configurations
TIMEOUT: isDevelopment ? 5000 : 30000,
};
export const getApiUrl = (endpoint) => {
    try {
      const baseUrl = new URL(config.API_BASE_URL);
      const path = endpoint.replace(/^\/+/, '');
      return new URL(path, baseUrl).toString();
    } catch (error) {
      console.error('Invalid URL construction:', error);
      return `${config.API_BASE_URL}${endpoint}`;
    }
};