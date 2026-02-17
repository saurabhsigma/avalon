# 🚀 Development Roadmap

## Phase-by-Phase Implementation Guide

---

## 📅 Timeline Overview

**Total Estimated Time**: 6-8 weeks

- **Phase 1 (Core MVP)**: 3 weeks
- **Phase 2 (AI & Features)**: 2 weeks  
- **Phase 3 (Advanced Features)**: 2 weeks
- **Testing & Polish**: 1 week

---

## 🏗️ PHASE 1: Core MVP (Week 1-3)

### Week 1: Foundation & Auth

#### Day 1-2: Project Setup
```bash
# Initialize Next.js project
npx create-next-app@latest web-a-thon --typescript --tailwind --app
cd web-a-thon

# Install core dependencies
npm install mongoose next-auth bcryptjs
npm install @hookform/react-hook-form zod
npm install zustand framer-motion
npm install lucide-react class-variance-authority clsx tailwind-merge

# Install dev dependencies
npm install -D @types/bcryptjs @types/node
npm install -D eslint prettier
```

**Tasks:**
- [x] Initialize Next.js 14 with App Router
- [x] Setup Tailwind CSS configuration
- [x] Configure TypeScript
- [x] Setup folder structure
- [x] Configure environment variables
- [x] Setup Git repository

**Files to Create:**
```
.env.local
.env.example
.gitignore
tsconfig.json
tailwind.config.js
next.config.js
```

---

#### Day 3-4: Database & Models
**Tasks:**
- [ ] Setup MongoDB Atlas account
- [ ] Create database connection utility (`lib/mongodb.ts`)
- [ ] Create User model with validation
- [ ] Create Class model
- [ ] Create Subject model
- [ ] Test database connections

**Priority Models:**
```typescript
// Priority Order:
1. User (required for auth)
2. Class (required for teacher dashboard)
3. Subject (required for class management)
```

---

#### Day 5-7: Authentication System
**Tasks:**
- [ ] Setup NextAuth.js configuration
- [ ] Create registration API route (`/api/auth/register`)
- [ ] Create login API route (`/api/auth/login`)
- [ ] Create auth middleware for route protection
- [ ] Build login page UI
- [ ] Build registration page UI
- [ ] Implement role-based redirects

**Priority:**
- Teacher auth first
- Student auth second

**Pages:**
```
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
```

---

### Week 2: Teacher Dashboard & Class Management

#### Day 1-2: Layout System
**Tasks:**
- [ ] Create TeacherLayout component
- [ ] Create Sidebar component
- [ ] Create Topbar component
- [ ] Implement responsive design
- [ ] Add theme toggle (light/dark)
- [ ] Test on mobile/tablet/desktop

**Components:**
```
components/layouts/TeacherLayout.tsx
components/layouts/Sidebar.tsx
components/layouts/Topbar.tsx
components/shared/ThemeToggle.tsx
```

---

#### Day 3-4: Teacher Dashboard
**Tasks:**
- [ ] Create dashboard page
- [ ] Build overview cards (stats)
- [ ] Display recent classes
- [ ] Show upcoming sessions
- [ ] API route: `/api/analytics/teacher/overview`
- [ ] Implement data fetching

**Page:**
```
app/(teacher)/teacher/dashboard/page.tsx
```

---

#### Day 5-7: Class Management
**Tasks:**
- [ ] API: Create class (`POST /api/teacher/classes`)
- [ ] API: Get all classes (`GET /api/teacher/classes`)
- [ ] API: Get class by ID (`GET /api/teacher/classes/[id]`)
- [ ] API: Update class (`PUT /api/teacher/classes/[id]`)
- [ ] API: Delete class (`DELETE /api/teacher/classes/[id]`)
- [ ] Build CreateClassDialog component
- [ ] Build ClassCard component
- [ ] Build class list page
- [ ] Build class detail page

**Components:**
```
components/teacher/CreateClassDialog.tsx
components/teacher/ClassCard.tsx
app/(teacher)/teacher/classes/page.tsx
app/(teacher)/teacher/class/[id]/page.tsx
```

---

### Week 3: LiveKit Integration & Attendance

#### Day 1-3: LiveKit Setup
**Tasks:**
- [ ] Create LiveKit Cloud account
- [ ] Get API credentials
- [ ] Install LiveKit SDK: `npm install livekit-client @livekit/components-react`
- [ ] Create Session model
- [ ] API: Schedule session (`POST /api/teacher/sessions`)
- [ ] API: Get LiveKit token (`POST /api/livekit/token`)
- [ ] Build VideoRoom component
- [ ] Test video/audio connectivity

**Components:**
```
components/livekit/VideoRoom.tsx
lib/livekit.ts
```

**LiveKit Config:**
```typescript
// lib/livekit.ts
import { AccessToken } from 'livekit-server-sdk';

export async function generateToken(
  roomName: string,
  identity: string,
  name: string,
  isTeacher: boolean
) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity,
      name,
    }
  );

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}
```

---

#### Day 4-5: Attendance System
**Tasks:**
- [ ] Create Attendance model
- [ ] Setup LiveKit webhook (`POST /api/livekit/webhook`)
- [ ] Handle participant_joined event
- [ ] Handle participant_left event
- [ ] Calculate attendance duration
- [ ] API: Get attendance (`GET /api/teacher/attendance`)
- [ ] Build AttendanceTable component

**Webhook Logic:**
```typescript
// app/api/livekit/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const { event, participant, room } = body;

  switch (event) {
    case 'participant_joined':
      // Create/update attendance record with join time
      await Attendance.create({
        sessionId: room.name,
        studentId: extractStudentId(participant.identity),
        joinTime: new Date(),
        status: 'present',
      });
      break;

    case 'participant_left':
      // Update attendance with leave time and duration
      const attendance = await Attendance.findOne({
        sessionId: room.name,
        studentId: extractStudentId(participant.identity),
      });
      
      attendance.leaveTime = new Date();
      attendance.duration = calculateDuration(
        attendance.joinTime,
        attendance.leaveTime
      );
      await attendance.save();
      break;
  }

  return Response.json({ success: true });
}
```

---

#### Day 6-7: Live Session Pages
**Tasks:**
- [ ] Build teacher session page
- [ ] Build student session page
- [ ] Implement join session flow
- [ ] Add chat panel
- [ ] Add participant list
- [ ] Add screen share controls
- [ ] Test end-to-end flow

**Pages:**
```
app/(teacher)/teacher/session/[id]/page.tsx
app/(student)/student/session/[id]/page.tsx
```

---

## 🎯 PHASE 2: AI & Enhanced Features (Week 4-5)

### Week 4: AI Integration (Groq)

#### Day 1-2: Groq Setup & Chat
**Tasks:**
- [ ] Create Groq account
- [ ] Get API key
- [ ] Install SDK: `npm install groq-sdk`
- [ ] Create Message model
- [ ] API: Chat endpoint (`POST /api/ai/chat`)
- [ ] Build ChatInterface component
- [ ] Implement conversation history
- [ ] Add language detection

**Groq Integration:**
```typescript
// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chat(
  messages: Message[],
  context: { subject?: string; grade?: string; language?: string }
) {
  const systemPrompt = `You are a helpful ${context.subject} teacher for ${context.grade}.
Use simple language. Respond in ${context.language || 'English'}.
Help students understand concepts but don't solve homework directly.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}
```

---

#### Day 3-4: AI Features
**Tasks:**
- [ ] API: Quiz generator (`POST /api/ai/quiz/generate`)
- [ ] API: Summary generator (`POST /api/ai/summarize`)
- [ ] API: Lesson plan helper (`POST /api/ai/lesson-plan`)
- [ ] Build QuizGenerator component
- [ ] Test AI responses
- [ ] Implement feedback system

**Components:**
```
components/ai/QuizGenerator.tsx
components/ai/SummaryCard.tsx
```

---

#### Day 5-7: Material Upload & Management
**Tasks:**
- [ ] Setup Cloudinary account
- [ ] Install: `npm install cloudinary`
- [ ] Create Material model
- [ ] API: Upload material (`POST /api/upload/file`)
- [ ] API: Get materials (`GET /api/teacher/materials`)
- [ ] Build MaterialUploader component
- [ ] Build MaterialCard component
- [ ] Support PDF, images, videos, links

**Upload Config:**
```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream((error, result) => {
      if (error) reject(error);
      resolve(result);
    }).end(buffer);
  });
}
```

---

### Week 5: Student Dashboard & Features

#### Day 1-2: Student Dashboard
**Tasks:**
- [ ] Create StudentLayout component
- [ ] Create BottomNav component (mobile)
- [ ] Build student dashboard page
- [ ] Display class info
- [ ] Show upcoming sessions
- [ ] Display attendance stats
- [ ] API: Student overview (`GET /api/analytics/student/overview`)

**Pages:**
```
app/(student)/student/dashboard/page.tsx
app/(student)/student/layout.tsx
```

---

#### Day 3-4: Quiz System
**Tasks:**
- [ ] Create Quiz model
- [ ] API: Create quiz (`POST /api/teacher/quizzes`)
- [ ] API: Get quizzes (`GET /api/student/quizzes`)
- [ ] API: Submit quiz (`POST /api/student/quizzes/[id]/attempt`)
- [ ] Build QuizCard component
- [ ] Build QuizTaker component
- [ ] Auto-grading system
- [ ] Show results with explanations

**Components:**
```
components/student/QuizCard.tsx
components/student/QuizTaker.tsx
components/teacher/CreateQuizDialog.tsx
```

---

#### Day 5-7: Performance Dashboard
**Tasks:**
- [ ] Create Performance model
- [ ] API: Get performance (`GET /api/student/performance`)
- [ ] Install charts: `npm install recharts`
- [ ] Build AttendanceChart component
- [ ] Build PerformanceChart component
- [ ] Display subject-wise analytics
- [ ] Show trends over time

**Components:**
```
components/charts/AttendanceChart.tsx
components/charts/PerformanceChart.tsx
components/student/PerformanceDashboard.tsx
```

---

## ⭐ PHASE 3: Advanced Features (Week 6-7)

### Week 6: Gamification & Doubts

#### Day 1-3: Gamification
**Tasks:**
- [ ] Add points & badges to User model
- [ ] API: Leaderboard (`GET /api/gamification/leaderboard`)
- [ ] API: Award points (`POST /api/gamification/award-points`)
- [ ] Build LeaderboardChart component
- [ ] Build AchievementBadge component
- [ ] Implement point system:
  - Attendance: 10 points per session
  - Quiz: Score-based points
  - Participation: 5 points per AI chat
- [ ] Design badge system

**Badges:**
```typescript
const badges = {
  perfect_attendance: 'Attended all sessions in a month',
  quiz_master: 'Scored 100% on 5 quizzes',
  early_bird: 'Joined 10 sessions early',
  helpful: 'Answered 20 doubts',
  consistent: '30-day login streak',
};
```

---

#### Day 4-7: Doubt System
**Tasks:**
- [ ] Create Doubt model
- [ ] API: Post doubt (`POST /api/student/doubts`)
- [ ] API: Get doubts (`GET /api/student/doubts`)
- [ ] Auto-generate AI response
- [ ] Build DoubtThread component
- [ ] Allow teacher responses
- [ ] Implement upvote system
- [ ] Public/private doubts

**Components:**
```
components/ai/DoubtThread.tsx
components/student/DoubtCard.tsx
```

---

### Week 7: Multilingual & Polish

#### Day 1-3: Internationalization
**Tasks:**
- [ ] Install: `npm install next-intl`
- [ ] Setup language files (en, hi, es, fr)
- [ ] Create LanguageSelector component
- [ ] Translate UI strings
- [ ] Configure AI for multilingual responses
- [ ] Test all languages

**Language Files:**
```
messages/
├── en.json
├── hi.json
├── es.json
└── fr.json
```

---

#### Day 4-7: Polish & Optimization
**Tasks:**
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Optimize images (Next.js Image)
- [ ] Code splitting
- [ ] SEO optimization
- [ ] Accessibility audit
- [ ] Performance optimization

**Performance Checklist:**
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lazy load heavy components
- [ ] Optimize bundle size

---

## 🧪 PHASE 4: Testing & Deployment (Week 8)

### Week 8: Testing & Launch

#### Day 1-3: Testing
**Tasks:**
- [ ] Write unit tests (Jest)
- [ ] Write integration tests
- [ ] E2E tests (Playwright)
- [ ] Test auth flows
- [ ] Test video calls
- [ ] Test AI responses
- [ ] Load testing
- [ ] Security audit

**Test Coverage:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
npm install -D @playwright/test
```

---

#### Day 4-5: Documentation
**Tasks:**
- [ ] Write README.md
- [ ] API documentation (Swagger)
- [ ] User guides (teacher & student)
- [ ] Setup instructions
- [ ] Environment variables guide
- [ ] Troubleshooting guide

---

#### Day 6-7: Deployment
**Tasks:**
- [ ] Deploy to Vercel
- [ ] Setup MongoDB Atlas production
- [ ] Configure environment variables
- [ ] Setup domain (optional)
- [ ] Configure LiveKit production
- [ ] Setup Cloudinary production
- [ ] Enable monitoring
- [ ] Setup error tracking (Sentry)

**Deployment Steps:**
```bash
# Vercel deployment
vercel login
vercel --prod

# Environment variables (set in Vercel dashboard)
- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- LIVEKIT_URL
- GROQ_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
```

---

## 📋 Daily Development Checklist

### Every Morning:
- [ ] Pull latest changes from Git
- [ ] Check for dependency updates
- [ ] Review previous day's work
- [ ] Plan today's tasks

### During Development:
- [ ] Write clean, documented code
- [ ] Test each feature immediately
- [ ] Commit frequently with clear messages
- [ ] Keep components small and reusable

### Every Evening:
- [ ] Push code to repository
- [ ] Update progress tracker
- [ ] Document any blockers
- [ ] Plan next day's tasks

---

## 🚨 Critical Path

**Must-Have Features (Cannot skip):**
1. ✅ Auth system
2. ✅ Class creation
3. ✅ LiveKit integration
4. ✅ Attendance tracking
5. ✅ Student dashboard
6. ✅ AI chatbot
7. ✅ Material upload

**Nice-to-Have Features (Can defer):**
- Gamification
- Advanced analytics
- Doubt system
- Quiz generator
- Multilingual

---

## 🔧 Quick Start Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

---

## 📊 Progress Tracking

### Phase 1 Progress: [ ] 0%
- [ ] Week 1: Foundation (0/7 days)
- [ ] Week 2: Teacher Dashboard (0/7 days)
- [ ] Week 3: LiveKit & Attendance (0/7 days)

### Phase 2 Progress: [ ] 0%
- [ ] Week 4: AI Integration (0/7 days)
- [ ] Week 5: Student Features (0/7 days)

### Phase 3 Progress: [ ] 0%
- [ ] Week 6: Advanced Features (0/7 days)
- [ ] Week 7: Polish (0/7 days)

### Phase 4 Progress: [ ] 0%
- [ ] Week 8: Testing & Deploy (0/7 days)

---

## 🎯 Success Criteria

### Technical:
- [x] All API endpoints functional
- [x] Video calls work smoothly
- [x] Attendance auto-tracked
- [x] AI responses accurate
- [x] Mobile responsive
- [x] < 2s page load

### Product:
- [x] Teacher can create classes
- [x] Teacher can schedule sessions
- [x] Students can join live classes
- [x] Attendance marked automatically
- [x] AI chatbot helps students
- [x] Materials can be uploaded

### Quality:
- [x] Zero critical bugs
- [x] 90%+ test coverage
- [x] Lighthouse score > 90
- [x] Accessible (WCAG 2.1 AA)

---

## 🆘 Need Help?

### Resources:
- **Next.js Docs**: https://nextjs.org/docs
- **LiveKit Docs**: https://docs.livekit.io
- **Groq API**: https://console.groq.com/docs
- **ShadCN UI**: https://ui.shadcn.com
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas

### Community:
- Next.js Discord
- LiveKit Slack
- Stack Overflow
- GitHub Discussions

---

## 🎉 Post-Launch Roadmap

### Month 2:
- [ ] User feedback collection
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Feature refinements

### Month 3:
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics
- [ ] Parent portal
- [ ] Recording feature

### Month 4+:
- [ ] API for third-party integrations
- [ ] White-label solution
- [ ] Enterprise features
- [ ] AI-powered insights
