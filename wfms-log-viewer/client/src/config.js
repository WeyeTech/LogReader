// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:4000'
  },
  production: {
    // Use the same domain as the frontend, but with API path
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://logreader-ui.prod-we.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 