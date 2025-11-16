Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed. Version: $nodeVersion" -ForegroundColor Green
    
    Write-Host "Installing project dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully." -ForegroundColor Green
        Write-Host "Starting the development server..." -ForegroundColor Yellow
        npm run dev
    } else {
        Write-Host "Failed to install dependencies. Please check your npm installation." -ForegroundColor Red
    }
} catch {
    Write-Host "Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation:" -ForegroundColor Yellow
    Write-Host "1. Close this window" -ForegroundColor Yellow
    Write-Host "2. Open a new PowerShell window" -ForegroundColor Yellow
    Write-Host "3. Navigate to this directory" -ForegroundColor Yellow
    Write-Host "4. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Press 'Y' to open the Node.js download page, or any other key to exit"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process "https://nodejs.org/"
    }
}