# 🎓 EduPlatform - Next-Gen Educational Platform

A modern, full-stack educational platform built with Next.js 14, TypeScript, MongoDB, LiveKit, Groq AI, and **Pinecone**. Enables teachers to create virtual classrooms with live video sessions, AI-powered chatbot with semantic search, smart attendance tracking, and gamification.

## ✨ Features

### For Teachers
- **Class Management** - Create and manage multiple classes with grades and sections
- **Subject Organization** - Add subjects to classes with custom colors and icons
- **Live Sessions** - Schedule and host virtual classrooms with LiveKit video
- **Smart Attendance** - Automatic attendance tracking via LiveKit webhooks
- **Material Upload** - Share PDFs, videos, images, and links with students (auto-indexed in Pinecone)
- **AI Quiz Generation** - Generate quizzes using Groq AI from session content
- **Analytics Dashboard** - View student performance and engagement metrics

### For Students
- **Virtual Classroom** - Join live sessions with video, audio, and screen sharing
- **AI Chatbot** - Get instant help from Groq-powered AI assistant with context from study materials
- **Semantic Search** - Find relevant study materials using natural language queries powered by Pinecone
- **Study Materials** - Access all shared resources organized by subject
- **Performance Tracking** - View quiz scores, attendance, and progress
- **Gamification** - Earn points, badges, and compete on leaderboards
- **Multilingual Support** - Interface available in English, Hindi, Spanish, French

### Core Technology
- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **LiveKit** for real-time video communication
- **Groq AI** for chatbot and quiz generation
- **Pinecone** for vector database and semantic search
- **Cloudinary** for file uploads
- **Tailwind CSS** with custom design system

## 🎯 Hackathon Sponsor Integration

### Pinecone - Semantic Search for Study Materials

This project leverages **Pinecone's vector database** (free tier) to provide intelligent, semantic search capabilities:

- **Automatic Indexing**: When teachers upload study materials, they're automatically embedded and stored in Pinecone
- **Smart Search**: Students can search using natural language queries like "explain photosynthesis" instead of exact keywords
- **Context-Aware AI**: The AI chatbot retrieves relevant materials from Pinecone to provide accurate, contextual answers
- **Free Tier**: Uses Pinecone's free tier (1 index, 100K vectors, 2GB storage)

**Key Features:**
- Vector embeddings for all study materials (PDFs, videos, documents)
- Cosine similarity search for relevant content retrieval
- Real-time indexing when materials are uploaded
- Filters by class and subject for targeted search

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- LiveKit account (free tier available)
- Groq API key (free tier available)
- **Pinecone account (free tier available)**
- Cloudinary account (optional for file uploads)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd web-a-thon
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database - Use MongoDB Atlas or local instance
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduplatform?retryWrites=true&w=majority

# Authentication - Generate with: openssl rand -base64 32
JWT_SECRET=your-secure-jwt-secret-here
NEXTAUTH_SECRET=your-secure-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# LiveKit - Sign up at https://livekit.io
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# Groq AI - Get free API key at https://console.groq.com
GROQ_API_KEY=your-groq-api-key

# Pinecone - Sign up at https://www.pinecone.io (Free tier: 1 index, 100K vectors)
PINECONE_API_KEY=your-pinecone-api-key

# Cloudinary - Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Getting Started Guide

### Creating Your First Class

1. **Register as Teacher**
   - Go to http://localhost:3000/register
   - Enter your details and select "Teacher" role
   - Click "Create Account"

2. **Login**
   - Go to http://localhost:3000/login
   - Enter your credentials
   - You'll be redirected to the teacher dashboard

3. **Create a Class**
   - Navigate to "Classes" in the sidebar
   - Click "Create Class"
   - Enter class name, grade, and section
   - Click "Create Class"

4. **Add Subjects**
   - Navigate to "Subjects" in the sidebar
   - Click "Add Subject"
   - Select your class, enter subject name
   - Choose a color for the subject
   - Click "Create Subject"

5. **Schedule a Session**
   - Navigate to "Sessions" in the sidebar
   - Click "Schedule Session"
   - Fill in session details (title, class, subject, time)
   - Click "Schedule Session"

## 🏗️ Project Structure

```
web-a-thon/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── classes/        # Class management
│   │   │   ├── subjects/       # Subject management
│   │   │   ├── sessions/       # Session management
│   │   │   └── livekit/        # LiveKit token generation
│   │   ├── teacher/            # Teacher pages
│   │   │   ├── dashboard/      # Teacher dashboard
│   │   │   ├── classes/        # Class management UI
│   │   │   ├── subjects/       # Subject management UI
│   │   │   └── sessions/       # Session management UI
│   │   ├── student/            # Student pages
│   │   │   └── dashboard/      # Student dashboard
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── mongodb.ts          # Database connection
│   │   └── utils.ts            # Utility functions
│   ├── models/                 # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Class.ts
│   │   ├── Subject.ts
│   │   ├── Session.ts
│   │   ├── Attendance.ts
│   │   ├── Material.ts
│   │   ├── Message.ts
│   │   ├── Quiz.ts
│   │   ├── Performance.ts
│   │   └── Doubt.ts
│   └── types/                  # TypeScript types
├── docs/                       # Documentation
├── public/                     # Static assets
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Zustand** - State management
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Real-time Features
- **LiveKit** - WebRTC video infrastructure
- **LiveKit Server SDK** - Token generation
- **LiveKit React Components** - Pre-built UI components

### AI Integration
- **Groq SDK** - AI API client
- **Llama 3 / Mixtral** - Language models

### File Upload
- **Cloudinary** - Cloud storage and CDN

## 🔐 Authentication Flow

1. User registers with email/password (bcrypt hashed)
2. User logs in → JWT token generated
3. Token stored in HTTP-only cookie
4. Protected routes verify JWT on server
5. Role-based access control (teacher/student)

## 📊 Database Schema

### User
- Authentication (email, passwordHash)
- Profile (name, avatar, role)
- Preferences (language, notifications, theme)
- Gamification (points, badges, level)

### Class
- Basic info (name, grade, section)
- Teacher reference
- Student list
- Subject list
- Schedule array

### Session
- Session details (title, description)
- Class & subject references
- Schedule (start/end times)
- LiveKit room ID
- Status (scheduled → live → completed)

### Attendance
- Auto-tracked via LiveKit webhooks
- Join/leave timestamps
- Duration calculation
- Status (present/absent/late)

## 🎥 LiveKit Integration

### Token Generation
```typescript
// Generate token for user
POST /api/livekit/token
Body: { roomName, participantName }
Response: { token, url }
```

### Room Permissions
- **Teachers**: Full admin access, can mute, kick, end session
- **Students**: Publish audio/video, chat, raise hand

## 🤖 Groq AI Integration

### Chatbot
- Context-aware responses
- Subject-specific knowledge
- Multilingual support
- Code syntax highlighting

### Quiz Generation
- Generate from session content
- Multiple choice questions
- Difficulty levels
- Explanations included

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation bar

## 🌍 Internationalization

Supported languages:
- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: HTTP-only cookies, 7-day expiry
- **CSRF Protection**: SameSite cookie policy
- **Input Validation**: Zod schemas on forms
- **MongoDB Injection**: Mongoose sanitization

## 🚧 Current Status

### ✅ Completed
- Core authentication system (register, login, JWT)
- Teacher dashboard with stats
- Student dashboard with upcoming sessions
- Class management (create, list, view)
- Subject management (create, list)
- Session scheduling and listing
- LiveKit token generation API
- All 10 database models
- Responsive layouts for teacher/student
- UI component library (Button, Card, Input, Badge, Dialog, Table)

### 🚧 In Progress
- Video room UI with LiveKit components
- Attendance webhook handler
- Material upload with Cloudinary
- Groq AI chatbot interface
- Quiz generation and taking
- Performance analytics
- Gamification system

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for better education
