// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:80'
  },
  production: {
    // Use the UI domain - Nginx will proxy /api/ requests to the backend
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://logreader-server.marketplace.svc.cluster'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 
