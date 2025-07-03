# Altius Capital - Website Crawler Assignment
# This Readme was written with ChatGPT 
## 🎯 Mission Overview

assignment for Altius Capital to create a site crawler that allows users to authenticate with external websites and view their available deals and files.

## 📋 Assignment Requirements

**Core Requirements:**
- Create a React frontend where users can choose a website and enter credentials
- Build a FastAPI backend that authenticates with external sites
- Display available deals and files from authenticated sessions
- Support multiple websites (fo1 and fo2)
- Implement file download functionality
- Handle authentication errors gracefully

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Router** for navigation
- Responsive design for mobile and desktop

### Backend (Python FastAPI)
- **FastAPI** framework
- **Pydantic** for data validation
- **Requests** library for external API calls
- **Environment-based configuration**
- Comprehensive error handling

### Project Structure
```
altius/
├── frontend/
│   └── frontend/           # React TypeScript app
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Application pages
│       │   ├── services/   # API communication
│       │   └── utils/      # Utility functions
│       └── public/         # Static assets
├── backend/
│   ├── models/            # Pydantic data models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── config.py          # Configuration settings
└── README.md
```

## 💡 Technical Solution

### Authentication Flow
1. **Website Selection**: Users choose between fo1 and fo2 websites
2. **Credential Submission**: Username/password sent to our API
3. **External Authentication**: Our backend authenticates with the target website
4. **Token Management**: Authentication tokens are managed securely
5. **Session Persistence**: Tokens stored in localStorage for session continuity

### Data Fetching Strategy
We reverse-engineered the target websites' API calls to understand their structure:

1. **API Analysis**: Monitored network requests to identify endpoints
2. **CSRF Handling**: Implemented proper headers and origin handling
3. **Three-Step Process**:
   - Get deals list (IDs and basic info)
   - Fetch detailed deal cards
   - Filter cards based on available list

### Security Considerations
- **Environment Variables**: Sensitive data stored in .env files
- **CORS Configuration**: Proper cross-origin resource sharing
- **Request Headers**: Mimics legitimate browser requests
- **Error Handling**: Secure error messages without exposing internals

## 🚀 Docker Deployment

Both frontend and backend are containerized using Docker:

```bash
# Frontend Container
docker pull oridaniel100/altius_capital_assignment:latest


## 🛠️ Installation & Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend/frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend .env:**
```env
FO1_BASE_URL=https://fo1.api.altius.finance
FO2_BASE_URL=https://fo2.api.altius.finance
DEBUG_MODE=True
LOG_API_REQUESTS=True
```

**Frontend .env:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📱 Features

### ✅ Completed Features
- [x] Multi-website authentication (fo1, fo2)
- [x] Secure credential handling
- [x] Deal listing and filtering
- [x] File download functionality
- [x] Responsive mobile design
- [x] Error handling and validation
- [x] Session management
- [x] Real-time API integration

### 🔄 API Endpoints
- `POST /auth/login` - User authentication
- `POST /deals/list` - Get available deals
- `POST /deals/{id}/files` - Get deal files

## 📊 Technical Challenges Solved

1. **CSRF Protection**: Implemented proper headers and referrer handling
2. **Multi-step Authentication**: Managed complex authentication flows
3. **Data Filtering**: Efficient filtering of large datasets
4. **Responsive Design**: Mobile-first approach with breakpoints
5. **Error Handling**: Graceful degradation and user feedback

**Author**: Ori Daniel  
**Assignment**: Altius Capital Site Crawler  
**Date**: 2025
