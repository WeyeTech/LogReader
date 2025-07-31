// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:4000'
  },
  production: {
    // Use the backend server domain for API calls
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://logreader-server.prod-we.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 