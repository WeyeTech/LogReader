#!/bin/bash

echo "🚀 Starting deployment process..."

# Navigate to client directory and build React app
echo "📦 Building React app..."
cd client
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ React app built successfully!"
else
    echo "❌ React app build failed!"
    exit 1
fi

# Navigate back to server directory
cd ../server

echo "🔧 Installing server dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed successfully!"
else
    echo "❌ Server dependencies installation failed!"
    exit 1
fi

echo "🎉 Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy the entire wfms-log-viewer folder to your server"
echo "2. Run 'npm start' in the server directory on your server"
echo "3. Access your app at http://your-server-domain.com:4000"
echo ""
echo "💡 The server will now serve both the API and the React app from the same port!" 