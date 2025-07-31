// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:4000'
  },
  production: {
    API_BASE_URL: '/app/logs'  // 🔧 Let NGINX proxy this
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 