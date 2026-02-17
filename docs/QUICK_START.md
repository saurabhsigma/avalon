# 🚀 Quick Start Guide

## Get Your Educational Platform Running in Minutes

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org))
- **MongoDB** account ([Sign up at MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** installed
- Code editor (VS Code recommended)

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/web-a-thon.git
cd web-a-thon

# Install dependencies
npm install
```

### Step 2: Environment Variables

Create `.env.local` file in root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# LiveKit (for video calls)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-url

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Detailed Setup

### 1. MongoDB Setup (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password
7. Paste in `.env.local` as `MONGODB_URI`

### 2. NextAuth Setup (1 minute)

Generate a secret key:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET=<generated_secret>
NEXTAUTH_URL=http://localhost:3000
```

### 3. LiveKit Setup (3 minutes)

1. Go to [LiveKit Cloud](https://cloud.livekit.io)
2. Sign up / Login
3. Create a new project
4. Go to Settings → Keys
5. Copy API Key, API Secret, and WebSocket URL
6. Add to `.env.local`

### 4. Groq AI Setup (2 minutes)

1. Go to [Groq Console](https://console.groq.com)
2. Sign up / Login
3. Generate API key
4. Add to `.env.local` as `GROQ_API_KEY`

### 5. Cloudinary Setup (2 minutes)

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up / Login
3. From Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `.env.local`

---

## 📦 Project Structure

```
web-a-thon/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (teacher)/         # Teacher dashboard routes
│   │   ├── (student)/         # Student dashboard routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (ShadCN)
│   │   ├── layouts/          # Layout components
│   │   ├── teacher/          # Teacher-specific components
│   │   ├── student/          # Student-specific components
│   │   ├── livekit/          # Video call components
│   │   └── ai/               # AI chatbot components
│   ├── lib/                  # Utility functions
│   ├── models/               # MongoDB models
│   ├── store/                # State management (Zustand)
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript types
├── public/                    # Static files
├── .env.local                # Environment variables (DO NOT COMMIT)
├── .env.example              # Example env file
├── package.json              # Dependencies
└── tailwind.config.js        # Tailwind configuration
```

---

## 🎯 First Steps After Setup

### Create Your First Teacher Account

1. Navigate to `http://localhost:3000/register`
2. Fill in details:
   - Name: Your Name
   - Email: teacher@test.com
   - Password: test123
   - Role: **Teacher**
3. Click "Register"
4. Login with credentials

### Create a Class

1. Go to Teacher Dashboard
2. Click "Create Class"
3. Fill in:
   - Name: "Physics 101"
   - Grade: "Class 10"
   - Section: "A"
   - Academic Year: "2025-26"
4. Click "Create"

### Schedule a Session

1. Click on your class
2. Click "Schedule Session"
3. Set date and time
4. Click "Schedule"

### Create a Student Account

1. Logout
2. Register as student with class ID
3. Login as student
4. See your class and scheduled sessions

---

## 🧪 Test Features

### Test Video Call
1. Schedule a session as teacher
2. Click "Start Session"
3. Allow camera/microphone permissions
4. Open in another browser as student
5. Join session
6. Test video, audio, chat

### Test AI Chatbot
1. Login as student
2. Go to "AI Assistant"
3. Ask: "Explain Newton's first law"
4. See AI response

### Test Attendance
1. Teacher starts session
2. Student joins
3. Student leaves
4. Teacher views attendance
5. See auto-tracked join/leave times

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB connection fails
**Solution:**
- Check connection string format
- Ensure IP whitelist includes your IP (0.0.0.0/0 for development)
- Verify database user password

### Issue: Video call doesn't work
**Solution:**
- Verify LiveKit credentials
- Check browser permissions for camera/mic
- Ensure ports are not blocked by firewall

### Issue: AI chatbot not responding
**Solution:**
- Verify Groq API key
- Check API quota limits
- Ensure internet connection

### Issue: File upload fails
**Solution:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure file type is supported

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
```

---

## 🔐 Default Test Accounts

After seeding database:

**Teacher Account:**
- Email: teacher@test.com
- Password: test123

**Student Account:**
- Email: student@test.com
- Password: test123

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables
6. Click "Deploy"

### Environment Variables for Production

Set these in Vercel dashboard:
- All variables from `.env.local`
- Change `NEXTAUTH_URL` to your production domain
- Use production URLs for LiveKit, MongoDB, etc.

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://www.mongodb.com/docs)
- [LiveKit Docs](https://docs.livekit.io)
- [Groq API Docs](https://console.groq.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tutorials
- [Next.js Tutorial](https://nextjs.org/learn)
- [MongoDB University](https://university.mongodb.com)
- [LiveKit Quickstart](https://docs.livekit.io/guides/getting-started/)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🆘 Need Help?

### Troubleshooting Steps
1. Check all environment variables are set
2. Restart development server
3. Clear browser cache
4. Check console for error messages
5. Verify all API keys are valid

### Get Support
- Open an issue on GitHub
- Check existing issues for solutions
- Join community Discord
- Read documentation thoroughly

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Auth system working (login/register)
- [ ] Can create classes
- [ ] Can schedule sessions
- [ ] Video calls working
- [ ] AI chatbot responding
- [ ] File uploads working
- [ ] Attendance tracking working
- [ ] Mobile responsive
- [ ] Dark mode working

---

## 🎉 You're Ready!

Your educational platform is now running. Start by:
1. Creating teacher and student accounts
2. Setting up a class
3. Scheduling a live session
4. Testing all features

**Happy Teaching & Learning! 🚀**
