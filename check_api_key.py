import os
from pathlib import Path

def check_api_key():
    """Check if Google AI API key is configured"""
    print("Checking for Google AI API key configuration...")
    
    # Check environment variables
    api_key = os.environ.get('GOOGLE_API_KEY')
    if api_key:
        print("✓ GOOGLE_API_KEY found in environment variables")
        print(f"  Key length: {len(api_key)} characters")
        # Don't print the actual key for security
    else:
        print("✗ GOOGLE_API_KEY not found in environment variables")
    
    # Check for .env.local file
    env_local_path = Path('.env.local')
    if env_local_path.exists():
        print("✓ .env.local file found")
        with open(env_local_path, 'r') as f:
            content = f.read()
            if 'GOOGLE_API_KEY' in content:
                print("✓ GOOGLE_API_KEY found in .env.local")
                # Extract just the key name without the value for security
                lines = content.split('\n')
                for line in lines:
                    if line.startswith('GOOGLE_API_KEY'):
                        key_part = line.split('=')[0] if '=' in line else line
                        print(f"  Key entry: {key_part}=...")
                        break
            else:
                print("✗ GOOGLE_API_KEY not found in .env.local")
    else:
        print("✗ .env.local file not found")
        print("  To configure your API key, create a .env.local file with:")
        print("  GOOGLE_API_KEY=your_actual_api_key_here")
    
    # Check for .env file
    env_path = Path('.env')
    if env_path.exists():
        print("✓ .env file found")
        with open(env_path, 'r') as f:
            content = f.read()
            if 'GOOGLE_API_KEY' in content:
                print("✓ GOOGLE_API_KEY found in .env")
            else:
                print("✗ GOOGLE_API_KEY not found in .env")
    else:
        print("ℹ .env file not found")
    
    print("\nTo get a Google AI API key:")
    print("1. Go to https://aistudio.google.com/")
    print("2. Sign in with your Google account")
    print("3. Create a new API key")
    print("4. Add it to your .env.local file as shown above")

if __name__ == "__main__":
    check_api_key()