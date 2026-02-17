# 🔌 API Routes Documentation

## Complete API Endpoint Reference

---

## 📋 Base URL Structure

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`
Register a new user (teacher or student)

**Request Body:**
```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  classId?: string; // Required for students
  language?: 'en' | 'hi' | 'es' | 'fr';
}
```

**Response:**
```typescript
{
  success: true;
  message: "Registration successful";
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}
```

**Errors:**
- 400: Missing required fields
- 409: Email already exists
- 500: Server error

---

### POST `/api/auth/login`
Login user

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    classId?: string;
  };
  token: string;
}
```

**Errors:**
- 400: Invalid credentials
- 401: Unauthorized
- 500: Server error

---

### POST `/api/auth/logout`
Logout user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Logged out successfully";
}
```

---

### GET `/api/auth/me`
Get current user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    classId?: string;
    avatar?: string;
    language: string;
    preferences: {
      theme: string;
      notifications: boolean;
    };
    points: number;
    badges: string[];
  }
}
```

---

### PUT `/api/auth/profile`
Update user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  avatar?: string;
  language?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    emailAlerts?: boolean;
  };
}
```

**Response:**
```typescript
{
  success: true;
  message: "Profile updated successfully";
  user: User;
}
```

---

## 👨‍🏫 Teacher Endpoints

### Classes

#### GET `/api/teacher/classes`
Get all classes created by teacher

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number; // default: 1
  limit?: number; // default: 10
  academicYear?: string;
  isActive?: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  classes: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

#### POST `/api/teacher/classes`
Create a new class

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  grade: string;
  section?: string;
  academicYear: string;
  description?: string;
  maxStudents?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Class created successfully";
  class: Class;
}
```

---

#### GET `/api/teacher/classes/[id]`
Get class details by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  class: Class & {
    subjects: Subject[];
    students: User[];
    sessionCount: number;
  };
}
```

---

#### PUT `/api/teacher/classes/[id]`
Update class details

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  maxStudents?: number;
  isActive?: boolean;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    subjectId: string;
  }[];
}
```

**Response:**
```typescript
{
  success: true;
  message: "Class updated successfully";
  class: Class;
}
```

---

#### DELETE `/api/teacher/classes/[id]`
Delete a class

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Class deleted successfully";
}
```

---

### Subjects

#### GET `/api/teacher/subjects`
Get all subjects

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  subjects: Subject[];
}
```

---

#### POST `/api/teacher/subjects`
Create a new subject

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  code: string;
  classId: string;
  description?: string;
  color?: string;
  icon?: string;
  syllabus?: {
    chapter: string;
    topics: string[];
  }[];
}
```

**Response:**
```typescript
{
  success: true;
  message: "Subject created successfully";
  subject: Subject;
}
```

---

#### PUT `/api/teacher/subjects/[id]`
Update subject

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  syllabus?: {
    chapter: string;
    topics: string[];
    completed: boolean;
  }[];
}
```

**Response:**
```typescript
{
  success: true;
  message: "Subject updated successfully";
  subject: Subject;
}
```

---

### Sessions

#### GET `/api/teacher/sessions`
Get all sessions

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId?: string;
  subjectId?: string;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  from?: string; // ISO date
  to?: string; // ISO date
}
```

**Response:**
```typescript
{
  success: true;
  sessions: Session[];
}
```

---

#### POST `/api/teacher/sessions`
Schedule a new session

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  title: string;
  classId: string;
  subjectId: string;
  scheduledAt: string; // ISO date
  duration: number; // minutes
  description?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Session scheduled successfully";
  session: Session & {
    livekitRoomId: string;
  };
}
```

---

#### PATCH `/api/teacher/sessions/[id]/start`
Start a scheduled session

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Session started";
  session: Session;
}
```

---

#### PATCH `/api/teacher/sessions/[id]/end`
End an ongoing session

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Session ended";
  session: Session;
  summary?: string; // AI-generated summary
}
```

---

### Materials

#### GET `/api/teacher/materials`
Get all study materials

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId?: string;
  subjectId?: string;
  type?: 'pdf' | 'video' | 'link' | 'document' | 'image';
}
```

**Response:**
```typescript
{
  success: true;
  materials: Material[];
}
```

---

#### POST `/api/teacher/materials`
Upload a new material

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```typescript
{
  file: File;
  title: string;
  type: string;
  classId: string;
  subjectId: string;
  description?: string;
  tags?: string[]; // JSON string
}
```

**Response:**
```typescript
{
  success: true;
  message: "Material uploaded successfully";
  material: Material;
}
```

---

#### DELETE `/api/teacher/materials/[id]`
Delete a material

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Material deleted successfully";
}
```

---

### Attendance

#### GET `/api/teacher/attendance`
Get attendance records

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId: string;
  sessionId?: string;
  date?: string; // ISO date
  from?: string; // ISO date
  to?: string; // ISO date
}
```

**Response:**
```typescript
{
  success: true;
  attendance: Attendance[];
  summary: {
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    averageAttendance: number;
  };
}
```

---

#### PATCH `/api/teacher/attendance/[id]`
Update attendance manually

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Attendance updated";
  attendance: Attendance;
}
```

---

### Quizzes

#### GET `/api/teacher/quizzes`
Get all quizzes

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId?: string;
  subjectId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  quizzes: Quiz[];
}
```

---

#### POST `/api/teacher/quizzes`
Create a new quiz

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  title: string;
  classId: string;
  subjectId: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    points: number;
  }[];
  duration: number;
  passingScore: number;
  dueDate?: string; // ISO date
}
```

**Response:**
```typescript
{
  success: true;
  message: "Quiz created successfully";
  quiz: Quiz;
}
```

---

#### GET `/api/teacher/quizzes/[id]/results`
Get quiz results

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  quiz: Quiz;
  results: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    attempts: {
      student: User;
      score: number;
      percentage: number;
      completedAt: Date;
    }[];
  };
}
```

---

## 🎓 Student Endpoints

### Classes

#### GET `/api/student/classes`
Get student's assigned class

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  class: Class & {
    subjects: Subject[];
    teacher: User;
  };
}
```

---

### Sessions

#### GET `/api/student/sessions`
Get available sessions

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  status?: 'scheduled' | 'live' | 'completed';
  subjectId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  sessions: Session[];
}
```

---

#### GET `/api/student/sessions/[id]`
Get session details

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  session: Session & {
    canJoin: boolean;
    hasJoined: boolean;
    materials: Material[];
  };
}
```

---

### Materials

#### GET `/api/student/materials`
Get study materials

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subjectId?: string;
  type?: string;
}
```

**Response:**
```typescript
{
  success: true;
  materials: Material[];
}
```

---

#### POST `/api/student/materials/[id]/view`
Track material view

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "View tracked";
}
```

---

### Attendance

#### GET `/api/student/attendance`
Get attendance history

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  from?: string; // ISO date
  to?: string; // ISO date
  subjectId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  attendance: Attendance[];
  stats: {
    totalSessions: number;
    attended: number;
    percentage: number;
    subjectWise: {
      subject: Subject;
      percentage: number;
    }[];
  };
}
```

---

### Quizzes

#### GET `/api/student/quizzes`
Get available quizzes

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subjectId?: string;
  status?: 'pending' | 'completed';
}
```

**Response:**
```typescript
{
  success: true;
  quizzes: (Quiz & {
    attempted: boolean;
    lastAttempt?: {
      score: number;
      percentage: number;
      completedAt: Date;
    };
  })[];
}
```

---

#### POST `/api/student/quizzes/[id]/attempt`
Submit quiz attempt

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  answers: number[];
  timeTaken: number; // seconds
}
```

**Response:**
```typescript
{
  success: true;
  message: "Quiz submitted successfully";
  result: {
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    correctAnswers: number;
    incorrectAnswers: number;
    details: {
      questionIndex: number;
      correct: boolean;
      explanation?: string;
    }[];
  };
}
```

---

### Performance

#### GET `/api/student/performance`
Get performance dashboard

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  performance: Performance;
  trends: {
    attendanceTrend: { month: string; rate: number }[];
    quizScoreTrend: { month: string; score: number }[];
  };
}
```

---

### Doubts

#### GET `/api/student/doubts`
Get student's doubts

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  status?: 'open' | 'answered' | 'resolved';
  subjectId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  doubts: Doubt[];
}
```

---

#### POST `/api/student/doubts`
Post a new doubt

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  title: string;
  description: string;
  subjectId: string;
  attachments?: string[];
  isPublic: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Doubt posted successfully";
  doubt: Doubt & {
    aiResponse: string; // AI-generated initial response
  };
}
```

---

#### POST `/api/student/doubts/[id]/upvote`
Upvote a doubt

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Upvoted";
  upvoteCount: number;
}
```

---

## 🎥 LiveKit Endpoints

### POST `/api/livekit/token`
Generate LiveKit access token

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  sessionId: string;
}
```

**Response:**
```typescript
{
  success: true;
  token: string;
  roomName: string;
  serverUrl: string;
  identity: string;
}
```

**Errors:**
- 403: Not authorized to join this session
- 404: Session not found
- 400: Session not started yet

---

### POST `/api/livekit/webhook`
Handle LiveKit webhook events

**Headers:**
```
livekit-webhook-signature: <signature>
```

**Request Body:**
```typescript
{
  event: 'participant_joined' | 'participant_left' | 'room_started' | 'room_finished';
  room: {
    name: string;
    sid: string;
  };
  participant?: {
    identity: string;
    sid: string;
    joinedAt: number;
  };
}
```

**Processing:**
- `participant_joined`: Create/update attendance record with join time
- `participant_left`: Update attendance with leave time and calculate duration
- `room_finished`: Generate session summary, mark session as completed

**Response:**
```typescript
{
  success: true;
}
```

---

## 🤖 AI Endpoints

### POST `/api/ai/chat`
Chat with AI assistant

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  message: string;
  sessionId: string; // Chat session ID
  context?: {
    classId?: string;
    subjectId?: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  response: string;
  messageId: string;
  metadata: {
    model: string;
    tokens: number;
    responseTime: number;
  };
}
```

---

### POST `/api/ai/chat/feedback`
Provide feedback on AI response

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  messageId: string;
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Feedback received";
}
```

---

### POST `/api/ai/quiz/generate`
AI-generate quiz from content

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subjectId: string;
  chapter: string;
  topics?: string[];
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

**Response:**
```typescript
{
  success: true;
  quiz: {
    title: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
  };
}
```

---

### POST `/api/ai/summarize`
Generate summary from session transcript

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  sessionId: string;
  transcript: string;
  format?: 'detailed' | 'brief' | 'bullet-points';
}
```

**Response:**
```typescript
{
  success: true;
  summary: string;
  keyPoints: string[];
  topics: string[];
}
```

---

### POST `/api/ai/lesson-plan`
AI-assisted lesson plan creation

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subjectId: string;
  topic: string;
  duration: number; // minutes
  grade: string;
  objectives?: string[];
}
```

**Response:**
```typescript
{
  success: true;
  lessonPlan: {
    title: string;
    objectives: string[];
    introduction: string;
    mainContent: {
      section: string;
      duration: number;
      activities: string[];
    }[];
    assessment: string[];
    homework: string[];
    resources: string[];
  };
}
```

---

## 📤 Upload Endpoints

### POST `/api/upload/file`
Upload file (images, documents, videos)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```typescript
{
  file: File;
  type: 'avatar' | 'material' | 'doubt-attachment';
}
```

**Response:**
```typescript
{
  success: true;
  url: string;
  fileSize: number;
  mimeType: string;
  publicId?: string; // For Cloudinary
}
```

**File Limits:**
- Images: 5 MB
- Documents: 10 MB
- Videos: 100 MB

---

### DELETE `/api/upload/file`
Delete uploaded file

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  publicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "File deleted successfully";
}
```

---

## 📊 Analytics Endpoints

### GET `/api/analytics/teacher/overview`
Teacher dashboard analytics

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    totalClasses: number;
    totalStudents: number;
    upcomingSessions: number;
    averageAttendance: number;
    recentActivity: {
      type: string;
      description: string;
      timestamp: Date;
    }[];
  };
}
```

---

### GET `/api/analytics/student/overview`
Student dashboard analytics

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    attendanceRate: number;
    averageQuizScore: number;
    rank: number;
    points: number;
    upcomingSessions: number;
    recentAchievements: string[];
  };
}
```

---

## 🏆 Gamification Endpoints

### GET `/api/gamification/leaderboard`
Get class leaderboard

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  classId: string;
  period?: 'week' | 'month' | 'year' | 'all-time';
}
```

**Response:**
```typescript
{
  success: true;
  leaderboard: {
    rank: number;
    student: User;
    points: number;
    badges: string[];
  }[];
}
```

---

### POST `/api/gamification/award-points`
Award points to student (teacher only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: string;
  points: number;
  reason: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Points awarded";
  student: {
    id: string;
    totalPoints: number;
  };
}
```

---

## ⚙️ Admin Endpoints (Future)

### GET `/api/admin/users`
Get all users

### POST `/api/admin/users/[id]/suspend`
Suspend user account

### GET `/api/admin/analytics`
System-wide analytics

---

## 🔔 Notification Endpoints

### GET `/api/notifications`
Get user notifications

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }[];
}
```

---

### PATCH `/api/notifications/[id]/read`
Mark notification as read

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Notification marked as read";
}
```

---

## 🚨 Error Response Format

All errors follow this structure:

```typescript
{
  success: false;
  error: {
    code: string; // Error code (e.g., "UNAUTHORIZED", "NOT_FOUND")
    message: string; // Human-readable error message
    details?: any; // Additional error details
  };
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): User not authenticated
- `FORBIDDEN` (403): User doesn't have permission
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Input validation failed
- `CONFLICT` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error
- `RATE_LIMIT` (429): Too many requests

---

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Token expires after 15 minutes. Use refresh token to get a new one.

---

## 📄 Pagination

List endpoints support pagination:

**Query Parameters:**
```typescript
{
  page: number; // default: 1
  limit: number; // default: 10, max: 100
  sortBy?: string; // field to sort by
  order?: 'asc' | 'desc'; // default: 'desc'
}
```

**Response:**
```typescript
{
  success: true;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## 🔍 Filtering & Search

Many GET endpoints support filtering:

```
GET /api/teacher/sessions?status=live&subjectId=xyz&from=2026-02-01
```

---

## 🚀 Rate Limiting

- **General**: 100 requests per 15 minutes
- **AI endpoints**: 20 requests per minute
- **Upload**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708704000
```

---

## 📚 API Versioning

Currently using v1 (implicit). Future versions will use:

```
/api/v2/...
```

---

## 🧪 Testing Endpoints

Use Postman, Insomnia, or curl for testing:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"password123"}'

# Get classes (with token)
curl http://localhost:3000/api/teacher/classes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 API Documentation Tools

Consider implementing:
- Swagger/OpenAPI spec
- Postman collection
- GraphQL playground (if using GraphQL)
