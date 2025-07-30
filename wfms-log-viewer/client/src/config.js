// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:4000'
  },
  production: {
    // Use a separate API server or port to avoid web server proxy issues
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://logreader-ui.prod-we.com:4000'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 