# 🏥 MediSummarize - AI-Powered Medical Transcription Summarization

## 📘 Project Description

**MediSummarize** is an intelligent, AI-powered web application that transforms medical transcriptions, handwritten notes, and clinical documents into structured, concise digital summaries. The system leverages advanced AI models through Google's Gemini API to extract and summarize key medical information from images and PDFs of medical documents. It provides healthcare professionals and patients with an efficient way to process and understand complex medical records.

## 🎯 Key Features

- **AI-Powered Summarization**: Uses Google's Gemini AI model to generate accurate medical summaries
- **Multi-Format Support**: Accepts images (JPG, PNG) and PDF files of medical documents
- **Medicine Extraction**: Automatically identifies and highlights medications mentioned in documents
- **Interactive Q&A**: Ask follow-up questions about the medical summary
- **Secure Authentication**: Firebase-based user authentication and data storage
- **Document History**: Save and access previous summaries
- **Download Capability**: Export summaries as text files
- **Responsive Design**: Works seamlessly across devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and responsive design
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icons

### AI & Backend
- **Genkit** - AI orchestration framework
- **Google Gemini API** - AI model for summarization
- **Node.js** - Runtime environment

### Database & Authentication
- **Firebase** - Authentication, Firestore database, and storage

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Turbopack** - Fast bundler (used in development)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/MedicaltranscriptionSummarizes.git
   cd MedicaltranscriptionSummarizes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root with your Google API key:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:9002](http://localhost:9002) to access the application

### Alternative: Quick Setup Scripts

The project includes setup scripts to help with installation:

**On Windows:**
```powershell
# Using PowerShell
.\setup-and-run.ps1
```

**Or using Python:**
```bash
python setup_and_run.py
```

## 🔐 Authentication

The application uses Firebase Authentication. New users can register using the registration page, and existing users can log in with their credentials. All medical documents and summaries are securely stored per user account.

## 📋 Usage

1. **Upload Medical Documents**: Drag and drop or click to upload images/PDFs of medical transcriptions
2. **Select Summary Length**: Choose between short, medium, or long summaries
3. **Generate Summary**: Click "Summarize & Save" to process the document with AI
4. **Review Summary**: View the AI-generated summary with medications highlighted
5. **Ask Questions**: Use the Q&A section to ask follow-up questions about the summary
6. **Download**: Save the summary as a text file for future reference

## 🤖 AI Capabilities

The application uses Google's Gemini 2.5 Flash model for:
- Extracting text from medical documents (OCR-like functionality through AI)
- Generating contextually accurate summaries of medical content
- Identifying medications and important medical terms
- Answering questions about the medical content

## 📁 Project Structure

```
src/
├── ai/                    # AI flows and configurations
│   ├── flows/            # Genkit AI flows (summarization, Q&A)
│   ├── genkit.ts         # AI configuration
│   └── dev.ts            # Development server
├── app/                  # Next.js app router pages
│   ├── dashboard/        # Main application dashboard
│   ├── login/            # Authentication pages
│   └── actions.ts        # Server actions
├── components/           # React components
│   ├── dashboard/        # Dashboard UI components
│   ├── ui/              # Reusable UI components
│   └── auth/            # Authentication components
├── firebase/            # Firebase configuration and utilities
└── lib/                 # Utility functions
```

## 🧪 Testing

The project includes a sample medical transcription file for testing:
- `test_medical_transcription.txt` - Sample document to test the summarization feature

## 🔧 Configuration

### API Key Setup

To use the AI features, you need a Google AI API key:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add it to your `.env.local` file as `GOOGLE_API_KEY`

### Firebase Configuration

The application uses Firebase for authentication and storage. The configuration is already set up in `src/firebase/config.ts` with the project credentials.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your Google AI API key is correctly set in `.env.local`
   - Verify the API key has proper permissions for the Gemini models
   - Check that the model `googleai/gemini-2.5-flash` is enabled in your Google AI project

2. **Document Upload Issues**
   - Ensure files are in supported formats (images: JPG, PNG; documents: PDF)
   - Check that files are not corrupted
   - Verify that file sizes are within reasonable limits

3. **Summarization Quality**
   - The quality depends on the clarity of the input document
   - For handwritten documents, ensure good image quality and lighting
   - Try different summary lengths to see what works best for your documents

### Known Limitations

- The AI model may occasionally misinterpret handwritten text
- Very complex medical terminology might not be summarized perfectly
- Large documents may take longer to process

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the existing issues in the repository
3. Create a new issue with detailed information about your problem
4. Include any error messages and steps to reproduce the issue

## 🙏 Acknowledgments

- Google AI for the Gemini models used in this application
- The Next.js team for the excellent React framework
- Firebase for authentication and database services
- The open-source community for various libraries used in this project

---

**Note**: This application is designed to assist with understanding medical documents but should not replace professional medical advice. Always consult healthcare professionals for medical decisions.
