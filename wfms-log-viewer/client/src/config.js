const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api' // frontend runs on 3000, backend on 80
  },
  production: {
    API_BASE_URL: '/api' // UI served from http://logreader-ui.prod-we.com, proxy /api to backend
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;
