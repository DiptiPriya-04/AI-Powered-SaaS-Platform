# AI-Powered SaaS Platform

**AI-Powered SaaS Platform** is an all-in-one AI creation studio offering dynamic content creation, ATS resume evaluation, text humanization, multi-turn PDF chat, and AI visual tools.

> 🚀 **Live Production Website:** [https://ai-powered-saas-platform-diptipriya-04s-projects.vercel.app](https://ai-powered-saas-platform-diptipriya-04s-projects.vercel.app)

---

## Features

### Free Tier (30 Free Credits)
- **AI Content Generator**: Create well-researched, human-like articles and essays (`/ai/write-article`).
- **Blog Title Suggester**: Generate engaging, click-worthy titles tailored to categories (`/ai/blog-titles`).
- **Text Humanizer**: Rewrite AI-generated text to make it natural and conversational (`/ai/humanize-text`).
- **Resume Reviewer**: In-depth executive feedback and improvement recommendations on PDF resumes (`/ai/review-resume`).
- **ATS Score Calculator**: Detailed candidate alignment, keyword matching, and breakdown against job descriptions (`/ai/calculate-ats-score`).

### Premium Tier (Subscription Required)
- **AI Art Generator**: High-fidelity visual creation powered by Clipdrop text-to-image API (`/ai/generate-images`).
- **Background Eraser**: Automated background removal for transparent product and portrait images (`/ai/remove-background`).
- **Object Eraser**: Intelligent generative removal of unwanted objects (`/ai/remove-object`).
- **Chat With PDF**: Multi-turn conversational AI directly with uploaded PDF documents (`/ai/chat-with-pdf`).
- **Community Showcase**: Discover and like creations published by creators (`/ai/community`).

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, GSAP, Lucide Icons, Clerk React SDK.
- **Backend**: Node.js, Express, Clerk Express SDK, Multer, Axios.
- **AI Engine**: Google Gemini 2.0 Flash (OpenAI-compatible endpoints), Clipdrop API.
- **Database & CDN**: Neon Serverless PostgreSQL, Cloudinary CDN.
local host :- http://localhost:5173/
  
---

## Project Structure

```
CreationSuite.ai/
├── client/                 # React frontend application (Vite)
│   ├── src/
│   │   ├── assets/         # Icons, images, navigation data
│   │   ├── components/     # UI components (Navbar, Sidebar, Plan, etc.)
│   │   ├── context/        # ThemeContext (Dark/Light mode)
│   │   ├── lib/            # Axios API helper & utilities
│   │   └── pages/          # Feature pages & dashboard
│   ├── .env.example        # Frontend environment template
│   └── package.json
├── server/                 # Express backend API
│   ├── configs/            # Database (Neon), Cloudinary, Multer
│   ├── controllers/        # AI and User controllers
│   ├── middlewares/        # Clerk auth middleware
│   ├── routes/             # Express routes (/api/ai, /api/user)
│   ├── .env.example        # Backend environment template
│   └── server.js
├── .env.example            # Root environment reference
└── package.json            # Root workspace scripts
```

---

## Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Clerk Account](https://clerk.com) for authentication
- [Google AI Studio](https://aistudio.google.com/) for Gemini API key
- [Neon Tech](https://neon.tech) for serverless PostgreSQL

### 2. Installation
Install dependencies for both client and server:
```bash
npm run install:all
```
*(Or run `npm install` inside both `client/` and `server/` directories)*

### 3. Environment Configuration

#### Backend (`server/.env`):
Create `server/.env` with:
```env
PORT=3000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIzaSy...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIPDROP_API_KEY=...
```

#### Frontend (`client/.env`):
Create `client/.env` with:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASE_URL=http://localhost:3000
```

### 4. Database Setup (Neon PostgreSQL)
Execute the following SQL in your Neon SQL console:
```sql
CREATE TABLE IF NOT EXISTS creations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    publish BOOLEAN DEFAULT FALSE,
    likes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_chats (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Running Locally
In separate terminals:
```bash
# Start backend API (http://localhost:3000)
npm run dev:server

# Start frontend application (http://localhost:5173)
npm run dev:client
```

---

## License
MIT License.
