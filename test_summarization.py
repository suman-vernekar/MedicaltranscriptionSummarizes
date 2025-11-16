import base64
import json
import os
import requests
from pathlib import Path

def create_test_document():
    """Create a simple test medical transcription document"""
    content = """
    Patient: John Doe
    Date: November 10, 2025
    
    Chief Complaint:
    Patient presents with persistent headache and fatigue for the past 3 days.
    
    History of Present Illness:
    Mr. Doe is a 45-year-old male who reports onset of severe headache 3 days ago. 
    Associated symptoms include fatigue, mild nausea, and sensitivity to light. 
    No fever or neck stiffness reported.
    
    Past Medical History:
    Hypertension, managed with Lisinopril 10mg daily
    Seasonal allergies
    
    Medications:
    Lisinopril 10mg daily
    Loratadine 10mg as needed
    
    Physical Examination:
    Vital signs: BP 135/85, HR 78, Temp 98.6°F
    Neurological: Alert and oriented, no focal deficits
    Head/Eyes: No papilledema, pupils equal and reactive
    
    Assessment:
    Likely tension headache, possibly exacerbated by stress
    
    Plan:
    1. Prescribe Ibuprofen 400mg three times daily as needed for pain
    2. Continue Lisinopril for hypertension
    3. Recommend stress management techniques
    4. Follow up in 1 week if symptoms persist
    """
    
    return content

def encode_text_as_data_uri(text_content):
    """Encode text content as a data URI"""
    encoded = base64.b64encode(text_content.encode('utf-8')).decode('utf-8')
    return f"data:text/plain;base64,{encoded}"

def test_summarization():
    """Test the summarization functionality"""
    print("Creating test medical transcription...")
    test_content = create_test_document()
    data_uri = encode_text_as_data_uri(test_content)
    
    print("Test document created.")
    print("\nDocument content preview:")
    print(test_content[:200] + "..." if len(test_content) > 200 else test_content)
    
    print("\nTo test the summarization:")
    print("1. Make sure the Next.js application is running (npm run dev)")
    print("2. Open your browser and go to http://localhost:9002")
    print("3. Log in or register an account")
    print("4. Navigate to the dashboard")
    print("5. Use the 'Upload Transcription' section to test with this content:")
    print("   - Copy the content above")
    print("   - Create a text file with this content")
    print("   - Upload the file in the application")
    print("   - Select summary length and click 'Summarize & Save'")
    
    print("\nIf the summary is not correct, possible issues:")
    print("1. Missing Google AI API key in environment variables")
    print("2. Issues with the prompt or model configuration")
    print("3. Document format not being processed correctly")

if __name__ == "__main__":
    test_summarization()