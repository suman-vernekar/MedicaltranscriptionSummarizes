import subprocess
import sys
import os
import webbrowser
import platform
import json

def check_node_installed():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        return result.returncode == 0, result.stdout.strip() if result.returncode == 0 else None
    except FileNotFoundError:
        return False, None

def install_dependencies():
    """Install project dependencies using npm"""
    try:
        result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except FileNotFoundError:
        return False, "", "npm not found"

def run_dev_server():
    """Run the development server"""
    try:
        # This will run in the foreground
        subprocess.run(['npm', 'run', 'dev'])
        return True, "", ""
    except FileNotFoundError:
        return False, "", "npm not found"
    except KeyboardInterrupt:
        return True, "Server stopped by user", ""

def download_and_install_nodejs():
    """Download and install Node.js"""
    system = platform.system()
    machine = platform.machine()
    
    print("Detecting system architecture...")
    print(f"System: {system}, Architecture: {machine}")
    
    if system == "Windows":
        # For Windows, we'll open the download page since automatic installation requires admin privileges
        print("Automatic installation requires administrator privileges.")
        print("Opening the Node.js download page...")
        webbrowser.open("https://nodejs.org/dist/latest/node-v20.18.0-x64.msi")
        print("Please download and run the installer as Administrator.")
        print("After installation, restart your computer and run this script again.")
        return False
    else:
        print("This script currently only supports automatic installation on Windows.")
        print("Please visit https://nodejs.org/ to download and install Node.js manually.")
        return False

def troubleshoot_summarization():
    """Provide troubleshooting steps for summarization issues"""
    print("\n=== Troubleshooting Summarization Issues ===")
    print("If the medical transcription summarization is not working correctly, try these steps:")
    
    print("\n1. Check API Key Configuration:")
    print("   - The application uses Google's Gemini AI model")
    print("   - You need to set up a Google AI API key")
    print("   - Create a .env.local file in the project root with:")
    print("     GOOGLE_API_KEY=your_actual_api_key_here")
    
    print("\n2. Verify Document Format:")
    print("   - The application accepts image files and PDFs")
    print("   - Text files need to be converted to PDF or image format")
    print("   - Try the test_medical_transcription.txt file provided")
    
    print("\n3. Check the AI Model Configuration:")
    print("   - The model is configured in src/ai/genkit.ts")
    print("   - Current model: googleai/gemini-2.5-flash")
    print("   - Ensure this model is available and properly configured")
    
    print("\n4. Review the Prompt Template:")
    print("   - Check src/ai/flows/summarize-medical-transcription.ts")
    print("   - The prompt might need adjustment for your specific document types")
    
    print("\n5. Test with the Sample Document:")
    print("   - Use the test_medical_transcription.txt file")
    print("   - Convert it to PDF if needed")
    print("   - Upload and test the summarization")

def main():
    print("Checking if Node.js is installed...")
    node_installed, node_version = check_node_installed()
    
    if node_installed:
        print(f"Node.js is installed. Version: {node_version}")
        print("Installing project dependencies...")
        
        success, stdout, stderr = install_dependencies()
        if success:
            print("Dependencies installed successfully.")
            print("Starting the development server...")
            print("The server will be available at http://localhost:9002")
            print("Press Ctrl+C to stop the server")
            
            success, stdout, stderr = run_dev_server()
            if not success:
                print(f"Error running development server: {stderr}")
        else:
            print(f"Failed to install dependencies: {stderr}")
            print("Please make sure you have internet connection and try again.")
    else:
        print("Node.js is not installed.")
        print("Attempting to help with Node.js installation...")
        
        if download_and_install_nodejs():
            # If installation was successful, try to continue
            print("Node.js installation completed. Please restart your terminal and run this script again.")
        else:
            # If automatic installation wasn't possible, provide manual instructions
            print("\nPlease follow these steps to install Node.js manually:")
            print("1. Visit https://nodejs.org/")
            print("2. Download the LTS version for your system")
            print("3. Run the installer as Administrator (on Windows)")
            print("4. Follow the installation wizard")
            print("5. Restart your computer after installation")
            print("\nAfter installing Node.js:")
            print("1. Close this window")
            print("2. Open a new command prompt or PowerShell window")
            print("3. Navigate to this directory")
            print("4. Run this script again")
        
        # Provide troubleshooting for summarization issues
        troubleshoot_summarization()

if __name__ == "__main__":
    main()