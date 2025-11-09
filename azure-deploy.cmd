:: azure-deploy.cmd
:: Build React and deploy full-stack Node.js + React app

@echo off
echo 🚀 Building React frontend...

:: Go to client folder
cd client

:: Install dependencies
call npm install

:: Build production React files
call npm run build

:: Move build to server root
cd ..
echo ✅ Build complete. Ready for Azure deployment.
