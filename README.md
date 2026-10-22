# 🚀 AI-Powered SaaS Platform (CreationSuite.ai)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CreationSuite.ai-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-powered-saas-platform-diptipriya-04s-projects.vercel.app)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-00e699?style=flat-square&logo=postgresql)](https://neon.tech)

> **All-in-one AI Creation Suite & Productivity Platform** — Create high-quality articles, generate catchy blog titles, humanize robotic text, evaluate resumes with recruiter feedback, check job ATS compatibility, generate stunning images with 8 art styles, remove backgrounds with transparent cutouts, interactive brush object inpainting, and chat with PDF documents in real-time.

🌐 **Live Deployed Application:** [https://ai-powered-saas-platform-diptipriya-04s-projects.vercel.app](https://ai-powered-saas-platform-diptipriya-04s-projects.vercel.app)

---

## 🌟 What is CreationSuite.ai? 

Imagine having a team of assistants available 24/7:
- A **senior copywriter** who writes full essays and articles in seconds.
- A **marketing wizard** who crafts irresistible, viral headlines for your blog or social posts.
- An **editor** who turns stiff, robotic AI text into natural, warm human writing.
- A **tech recruiter** who inspects your resume, tells you why it stands out or falls short, and gives you exact advice to get hired.
- A **career coach** who grades your resume against any job description with a percentage match.
- A **digital artist & photo editor** who generates photos from text, cuts out backgrounds cleanly, and magically erases photo bombers.
- A **research analyst** who reads 50-page PDF reports and answers your exact questions with page citations.

**CreationSuite.ai brings all these powers together into a single, lightning-fast dashboard** with modern dark/light mode, real-time feedback, and zero clunkiness.

---

## 🛠️ The 10+ AI Tools Explained Simply (Layman's Guide)

### 1. ✍️ AI Article & Essay Writer (`/ai/write-article`)
- **What it does:** Type any topic (e.g. *"The Future of Electric Cars"*) and pick your desired length. The AI crafts a structured, ready-to-publish article with introductions, bullet points, key takeaways, and conclusions.
- **Why it matters:** Eliminates writer's block. No prompt noise or weird machine labels—just clean, well-formatted Markdown ready to copy or share.

### 2. 💡 Blog Title Suggester (`/ai/blog-titles`)
- **What it does:** Enter your subject and preferred category (General, Tech, Business, Lifestyle, Health, Education). You instantly receive 5 catchy, high-engagement headlines formatted as interactive cards.
- **Why it matters:** Headlines make or break content engagement. Each title is click-worthy, modern, and copyable with a single tap.

### 3. 🎭 Text Humanizer & Polisher (`/ai/humanize-text`)
- **What it does:** Paste rigid, robotic text from basic AI tools or rough drafts. It rewrites the sentences to sound conversational, flowing, and genuinely human.
- **Why it matters:** Perfect for emails, cover letters, and blog posts where you want a friendly, authentic human voice.

### 4. 📄 AI Resume Reviewer & Career Coach (`/ai/review-resume`)
- **What it does:** Upload your PDF resume. The AI thoroughly scans your experience, education, and skills. It provides:
  1. An overall score (0–100) and candidate summary.
  2. Concrete strengths with quoted resume evidence.
  3. Actionable improvements.
  4. **2–3 tailored recruiter recommendations** highlighting how to position yourself for top interviews.
- **Why it matters:** Gives you insider recruiter-level feedback in 3 seconds before you hit "Apply".

### 5. 🎯 ATS Score Calculator & Job Matcher (`/ai/calculate-ats-score`)
- **What it does:** Upload your resume PDF and paste the target job description. The AI calculates an **Applicant Tracking System (ATS) compatibility score**, showing matched keywords, missing critical skills, and step-by-step advice to reach 90%+.
- **Why it matters:** Most companies use automated filters. This tool ensures your resume actually makes it to a human recruiter's desk.

### 6. 🎨 AI Art & Image Generator (`/ai/generate-images`)
- **What it does:** Describe any visual scene (e.g. *"A futuristic cyberpunk cafe in Tokyo at dusk"*) and choose from 8 curated art styles (Realistic, Studio Ghibli, Anime, 3D Pixar, Cartoon, Fantasy, Portrait). The engine synthesizes a high-resolution, vivid digital artwork instantly.
- **Why it matters:** Creates custom marketing imagery, hero banners, and social posts without prompt refusals or paid stock photo subscriptions.

### 7. 🪄 AI Background Remover (`/ai/remove-background`)
- **What it does:** Upload any photo of a person, product, or logo. The on-device neural network model isolates the subject and removes the backdrop into a **100% transparent PNG cutout** with an authentic checkerboard preview and side-by-side comparison.
- **Why it matters:** Truly removes backgrounds (no identical photo fallbacks). Essential for e-commerce products, headshots, and clean presentation graphics.

### 8. 🧼 Smart Canvas Object Eraser & Inpainter (`/ai/remove-object`)
- **What it does:** Interactive brush canvas where you can paint directly over unwanted photobombers, text watermarks, or blemishes. The radial inpainting algorithm reconstructs surrounding background textures to seamlessly erase the object.
- **Why it matters:** Clean, real object removal directly in the browser—no expensive desktop graphic software needed.

### 9. 💬 Chat with PDF & Research Assistant (`/ai/chat-with-pdf`)
- **What it does:** Upload any document (contracts, research papers, financial reports, user manuals) and ask questions in plain English.
- **Why it matters:** You don't have to scroll through 100 pages. Ask *"What are the payment terms in section 4?"* and receive an exact answer immediately.

### 10. 🌐 Community Showcase & Gallery (`/ai/community`)
- **What it does:** Browse creative articles, essays, and ideas shared by other users. Like favorite posts and publish your own creations with a single toggle.
- **Why it matters:** Fosters collaboration and sparks creativity by seeing what others are generating.

### 11. 💳 Free Quota & Premium Plan Management
- **What it does:** New users receive **30 free creation credits**. Once depleted, interactive upgrade modals guide users to upgrade to **Premium** for unlimited usage across all standard and visual tools.
- **Why it matters:** Seamless freemium SaaS business model implemented with Clerk user metadata and PostgreSQL state tracking.

---

## ⚡ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, GSAP animations, Lucide Icons, React Router 7.
- **Backend**: Node.js, Express, Clerk Express SDK, Multer in-memory streaming, pdf-parse.
- **AI & ML Engine**: Google Gemini 2.0 Flash API (with robust resilient fallbacks for 100% uptime), Clipdrop API.
- **Database & Storage**: Neon Serverless PostgreSQL, Cloudinary CDN.
- **Deployment**: Vercel (multi-service unified full-stack hosting).

---

## 💻 Running Locally in 3 Steps

### 1. Clone the repository
```bash
git clone <repository-url>
cd CreationSuite.ai
```

### 2. Install dependencies
```bash
# In client/
cd client && npm install

# In server/
cd ../server && npm install
```

### 3. Launch both dev servers
```bash
# Terminal 1: Backend API (http://localhost:3000)
cd server && npm run dev

# Terminal 2: Frontend App (http://localhost:5173)
cd client && npm run dev
```

---

## 🔐 Environment Variables Guide

### Backend (`server/.env`):
```env
PORT=3000
DATABASE_URL=postgresql://neondb_owner:......
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=AIzaSy...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIPDROP_API_KEY=...
```

### Frontend (`client/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASE_URL=http://localhost:3000
```

> **Note:** The platform includes automatic development sandboxing. Even if third-party keys are temporarily omitted in staging, fallbacks keep the application responsive and testable without runtime crashes.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
