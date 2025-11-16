@echo off
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js is installed.
    echo Installing project dependencies...
    npm install
    if %errorlevel% == 0 (
        echo Dependencies installed successfully.
        echo Starting the development server...
        npm run dev
    ) else (
        echo Failed to install dependencies. Please check your npm installation.
    )
) else (
    echo Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    echo After installation:
    echo 1. Close this window
    echo 2. Open a new command prompt or PowerShell window
    echo 3. Navigate to this directory
    echo 4. Run this script again
    echo.
    echo Press any key to open the Node.js download page...
    pause >nul
    start "" "https://nodejs.org/"
)