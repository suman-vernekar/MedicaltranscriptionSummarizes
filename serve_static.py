import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

def serve_static_files():
    """Serve static files from the project directory"""
    # This is a simple HTTP server to view static files
    # It won't run the Next.js application, but will let you see the file structure
    
    PORT = 8000
    
    # Change to the project directory
    os.chdir(Path(__file__).parent)
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving static files at http://localhost:{PORT}")
        print("Note: This won't run the Next.js application, but will let you browse the files")
        print("Press Ctrl+C to stop the server")
        
        # Open the browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    serve_static_files()