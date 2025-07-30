# Deployment Guide

## Fix for "Unexpected token '<', "<!doctype "... is not valid JSON" Error

This error occurs when the React app tries to make API calls to relative URLs in production, but the proxy configuration only works in development.

## Changes Made

1. **Updated API calls** to use absolute URLs instead of relative paths
2. **Removed proxy configuration** from package.json
3. **Added configuration file** for environment-specific API URLs
4. **Updated CORS settings** for production deployment

## Deployment Steps

### 1. Update API URL Configuration

Edit `wfms-log-viewer/client/src/config.js` and update the production API URL:

```javascript
production: {
  API_BASE_URL: 'http://your-actual-server-domain.com:4000'
}
```

### 2. Update CORS Configuration

Edit `wfms-log-viewer/server/server.js` and update the CORS origins:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-frontend-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Build and Deploy

```bash
# Build the React app
cd wfms-log-viewer/client
npm run build

# Deploy the build folder to your web server
# Deploy the server folder to your API server
```

### 4. Environment Variables (Optional)

You can also set the API URL using environment variables:

```bash
# Set environment variable before building
export REACT_APP_API_URL=http://your-server-domain.com:4000
npm run build
```

## Alternative Solutions

### Option 1: Web Server Proxy (Nginx/Apache)

Configure your web server to proxy API requests:

**Nginx:**
```nginx
location /api/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Option 2: Serve Both from Node.js

Update server.js to serve React build files:

```javascript
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
```

## Testing

1. Start the backend server: `cd server && npm start`
2. Build and serve the frontend
3. Test API calls in browser console
4. Check for CORS errors in browser developer tools

## Troubleshooting

- **CORS errors**: Update the CORS origins in server.js
- **404 errors**: Ensure the API URL is correct in config.js
- **Connection refused**: Check if the backend server is running on the correct port 