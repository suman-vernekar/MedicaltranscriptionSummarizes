# 🏥 SUMMARIZATION OF HANDWRITTEN MEDICAL TRANSCRIPT

## 📘 Project Description
Handwritten medical documents such as prescriptions, clinical notes, discharge summaries, and diagnostic reports are an essential part of healthcare documentation. However, these handwritten records often suffer from poor readability, inconsistent formatting, and ambiguous handwriting styles. Manual interpretation of such documents is time-consuming, error-prone, and can negatively affect clinical decision-making.

The **Summarization of Handwritten Medical Transcript** project is an intelligent, AI-based system that automates the process of converting handwritten medical documents into structured, readable, and concise digital summaries. The system integrates **Optical Character Recognition (OCR)** for text extraction and **Natural Language Processing (NLP)** techniques for summarization. It significantly reduces human effort, improves accuracy, and enhances accessibility of medical information.

---

## 🎯 Aim of the Project
To develop an intelligent web-based system capable of:
- Extracting handwritten medical text accurately
- Generating meaningful summaries of medical content
- Improving efficiency and reliability in healthcare documentation

---

## 🧩 Problem Statement
Handwritten medical transcripts are difficult to read and interpret due to variations in handwriting, abbreviations, and unstructured formats. Manual transcription is slow and prone to errors. There is a need for an automated solution that can convert handwritten medical notes into digital text and summarize important medical information efficiently.

---

## 📌 Objectives
- Automate extraction of handwritten medical text using OCR  
- Generate concise and structured summaries using NLP  
- Reduce manual transcription errors  
- Improve accessibility and readability of medical records  
- Provide a secure and user-friendly web application  

---

## 📚 Scope of the Project
- Supports handwritten and printed medical documents  
- Accepts image and PDF file formats  
- Generates summaries highlighting key medical information  
- Can be integrated with digital health systems in future  

---

## 🛠️ Technologies Used

### Programming Language
- Python 3.10+

### Backend
- Flask

### Frontend
- HTML  
- CSS  
- JavaScript  

### OCR Technologies
- Tesseract OCR  
- EasyOCR  

### NLP & AI
- Hugging Face Transformers  
- BART Large CNN  
- NLTK  
- spaCy  

### Database
- MongoDB  

---

## ⚙️ System Features
- Handwritten text extraction from images and PDFs  
- AI-powered medical text summarization  
- Rule-based summaries for short text  
- Secure user authentication and session handling  
- Medical document history tracking  
- PDF summary download option  
- Responsive user interface  

---

## 🧠 Methodology
1. User uploads handwritten medical document  
2. Image or PDF preprocessing  
3. OCR-based text extraction  
4. Text length analysis  
5. Rule-based or AI-based summarization  
6. Display summarized output  
7. Download summary or upload new document  

---

## 🧩 System Architecture
- User Interface  
- Image & PDF Preprocessing Module  
- OCR Module  
- NLP Summarization Module  
- Database Module  
- Output & Download Module  

---

## 🔄 System Flow
Start → Upload File → File Type Check → OCR Processing →  
Text Length Check → Summarization → Display Results →  
Download / New Upload → End

---

## 📋 Hardware Requirements
- Processor: Intel i5/i7 or Ryzen 5/7  
- RAM: Minimum 8 GB (16 GB recommended)  
- Storage: 256 GB SSD or higher  
- Scanner or Camera  

---

## 💻 Software Requirements
- Windows / Linux / macOS  
- Python 3.10+  
- MongoDB  
- Tesseract OCR  

---

## 🚀 Installation & Execution Steps

# Step 1: Clone the Repository
git clone https://github.com/your-username/medical-transcript-summarization.git
cd medical-transcript-summarization

# Step 2: Create Virtual Environment (Optional but Recommended)
python -m venv venv

# Activate virtual environment
# For Linux / macOS
source venv/bin/activate

# For Windows
venv\Scripts\activate

# Step 3: Install Required Packages
pip install -r requirements.txt

# Step 4: Configure Environment Variables
# Create a .env file in the project root and add:
# SECRET_KEY=your_secret_key
# MONGO_URI=your_mongodb_connection_string

# Step 5: Run the Application
python app.py

# Step 6: Access the Application
# Open your browser and go to:
# http://127.0.0.1:5000

