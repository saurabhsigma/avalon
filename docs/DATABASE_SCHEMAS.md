# 🗄️ MongoDB Database Schemas

## Complete Schema Definitions with Mongoose

---

## 1. User Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'teacher' | 'student';
  classId?: mongoose.Types.ObjectId;
  avatar?: string;
  language: 'en' | 'hi' | 'es' | 'fr';
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailAlerts: boolean;
  };
  points: number; // Gamification
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: function() {
        return this.role === 'student';
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'es', 'fr'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      emailAlerts: {
        type: Boolean,
        default: true,
      },
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, classId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

---

## 2. Class Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  _id: string;
  name: string;
  grade: string; // "Class 10", "Class 12", etc.
  section?: string; // "A", "B", etc.
  teacherId: mongoose.Types.ObjectId;
  subjects: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  academicYear: string; // "2025-26"
  description?: string;
  maxStudents?: number;
  isActive: boolean;
  schedule: {
    day: string; // "Monday", "Tuesday", etc.
    startTime: string; // "09:00"
    endTime: string; // "10:00"
    subjectId: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    academicYear: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: String,
      endTime: String,
      subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
ClassSchema.index({ teacherId: 1 });
ClassSchema.index({ academicYear: 1, isActive: 1 });

// Virtual for student count
ClassSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
```

---

## 3. Subject Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  _id: string;
  name: string;
  code: string; // "PHY101", "MATH201"
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  description?: string;
  color?: string; // For UI differentiation
  icon?: string;
  syllabus?: {
    chapter: string;
    topics: string[];
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: {
      type: String,
      default: '📚',
    },
    syllabus: [{
      chapter: {
        type: String,
        required: true,
      },
      topics: [String],
      completed: {
        type: Boolean,
        default: false,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
SubjectSchema.index({ classId: 1 });
SubjectSchema.index({ teacherId: 1 });
SubjectSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
```

---

## 4. Session Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  title: string;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  livekitRoomId: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  description?: string;
  materials: mongoose.Types.ObjectId[];
  recording?: {
    url: string;
    duration: number;
    size: number;
  };
  transcript?: string;
  summary?: string;
  participants: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    duration: number;
  }[];
  chat: {
    userId: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    livekitRoomId: {
      type: String,
      required: true,
      unique: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    materials: [{
      type: Schema.Types.ObjectId,
      ref: 'Material',
    }],
    recording: {
      url: String,
      duration: Number,
      size: Number,
    },
    transcript: {
      type: String,
    },
    summary: {
      type: String,
    },
    participants: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: Date,
      leftAt: Date,
      duration: Number,
    }],
    chat: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
SessionSchema.index({ classId: 1, scheduledAt: -1 });
SessionSchema.index({ teacherId: 1, status: 1 });
SessionSchema.index({ livekitRoomId: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
```

---

## 5. Attendance Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  _id: string;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late' | 'excused';
  joinTime?: Date;
  leaveTime?: Date;
  duration: number; // in minutes
  isAutoMarked: boolean;
  remarks?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    joinTime: {
      type: Date,
    },
    leaveTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isAutoMarked: {
      type: Boolean,
      default: true,
    },
    remarks: {
      type: String,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
AttendanceSchema.index({ studentId: 1, date: -1 });
AttendanceSchema.index({ classId: 1, date: -1 });

// Calculate attendance percentage
AttendanceSchema.statics.getAttendancePercentage = async function(
  studentId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) {
  const total = await this.countDocuments({
    studentId,
    date: { $gte: startDate, $lte: endDate },
  });
  
  const present = await this.countDocuments({
    studentId,
    status: { $in: ['present', 'late'] },
    date: { $gte: startDate, $lte: endDate },
  });
  
  return total > 0 ? (present / total) * 100 : 0;
};

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
```

---

## 6. Material Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  _id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'image';
  url: string;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  description?: string;
  fileSize?: number; // in bytes
  duration?: number; // for videos, in seconds
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document', 'image'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    fileSize: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MaterialSchema.index({ classId: 1, subjectId: 1 });
MaterialSchema.index({ uploadedBy: 1 });
MaterialSchema.index({ tags: 1 });

export default mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
```

---

## 7. Message Schema (AI Chat)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  sessionId?: string; // Chat session ID
  role: 'user' | 'assistant' | 'system';
  content: string;
  context?: {
    classId?: mongoose.Types.ObjectId;
    subjectId?: mongoose.Types.ObjectId;
    language?: string;
  };
  metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
  };
  feedback?: {
    rating?: number; // 1-5
    helpful?: boolean;
    comment?: string;
  };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    context: {
      classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
      },
      subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
      language: String,
    },
    metadata: {
      model: String,
      tokens: Number,
      responseTime: Number,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      helpful: Boolean,
      comment: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
```

---

## 8. Quiz Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  _id: string;
  title: string;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation?: string;
    points: number;
  }[];
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  isActive: boolean;
  dueDate?: Date;
  attempts: {
    studentId: mongoose.Types.ObjectId;
    answers: number[];
    score: number;
    percentage: number;
    completedAt: Date;
    timeTaken: number; // in seconds
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [{
      question: {
        type: String,
        required: true,
      },
      options: {
        type: [String],
        required: true,
        validate: {
          validator: (v: string[]) => v.length >= 2 && v.length <= 6,
          message: 'Must have 2-6 options',
        },
      },
      correctAnswer: {
        type: Number,
        required: true,
      },
      explanation: String,
      points: {
        type: Number,
        default: 1,
      },
    }],
    duration: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dueDate: {
      type: Date,
    },
    attempts: [{
      studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      answers: [Number],
      score: Number,
      percentage: Number,
      completedAt: Date,
      timeTaken: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
QuizSchema.index({ classId: 1, subjectId: 1 });
QuizSchema.index({ createdBy: 1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
```

---

## 9. Performance Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformance extends Document {
  _id: string;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  metrics: {
    attendanceRate: number; // percentage
    averageQuizScore: number; // percentage
    totalPointsEarned: number;
    rank?: number;
    participationScore: number; // based on AI chat, doubts asked, etc.
  };
  subjectWise: {
    subjectId: mongoose.Types.ObjectId;
    attendanceRate: number;
    averageQuizScore: number;
    lastQuizScore?: number;
    improvement: number; // percentage change
  }[];
  achievements: {
    type: string; // "perfect_attendance", "top_scorer", etc.
    earnedAt: Date;
    description: string;
  }[];
  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceSchema = new Schema<IPerformance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    metrics: {
      attendanceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageQuizScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalPointsEarned: {
        type: Number,
        default: 0,
      },
      rank: Number,
      participationScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    subjectWise: [{
      subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
      attendanceRate: Number,
      averageQuizScore: Number,
      lastQuizScore: Number,
      improvement: Number,
    }],
    achievements: [{
      type: String,
      earnedAt: Date,
      description: String,
    }],
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PerformanceSchema.index({ studentId: 1 });
PerformanceSchema.index({ classId: 1, 'metrics.rank': 1 });

export default mongoose.models.Performance || mongoose.model<IPerformance>('Performance', PerformanceSchema);
```

---

## 10. Doubt Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IDoubt extends Document {
  _id: string;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  attachments?: string[];
  status: 'open' | 'answered' | 'resolved' | 'closed';
  aiResponse?: string;
  teacherResponse?: string;
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
  upvotes: mongoose.Types.ObjectId[]; // student IDs who upvoted
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema = new Schema<IDoubt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [String],
    status: {
      type: String,
      enum: ['open', 'answered', 'resolved', 'closed'],
      default: 'open',
    },
    aiResponse: {
      type: String,
    },
    teacherResponse: {
      type: String,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: {
      type: Date,
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DoubtSchema.index({ classId: 1, subjectId: 1, status: 1 });
DoubtSchema.index({ studentId: 1, createdAt: -1 });

// Virtual for upvote count
DoubtSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

export default mongoose.models.Doubt || mongoose.model<IDoubt>('Doubt', DoubtSchema);
```

---

## Database Relationships Diagram

```
User
├─ hasOne → Performance
├─ hasMany → Messages
├─ hasMany → Attendance
└─ belongsTo → Class (if student)

Class
├─ belongsTo → User (teacher)
├─ hasMany → Subject
├─ hasMany → Session
├─ hasMany → Student (User)
└─ hasMany → Attendance

Subject
├─ belongsTo → Class
├─ belongsTo → User (teacher)
├─ hasMany → Session
├─ hasMany → Material
└─ hasMany → Quiz

Session
├─ belongsTo → Class
├─ belongsTo → Subject
├─ belongsTo → User (teacher)
├─ hasMany → Attendance
└─ hasMany → Material

Attendance
├─ belongsTo → Student (User)
├─ belongsTo → Class
├─ belongsTo → Subject
└─ belongsTo → Session

Quiz
├─ belongsTo → Class
├─ belongsTo → Subject
├─ belongsTo → User (teacher)
└─ hasMany → Attempts (embedded)

Performance
├─ belongsTo → Student (User)
├─ belongsTo → Class
└─ references → Subject (multiple)

Doubt
├─ belongsTo → Student (User)
├─ belongsTo → Class
├─ belongsTo → Subject
└─ belongsTo → User (teacher, optional)
```

---

## Indexing Strategy

### Critical Indexes
```javascript
// User lookups by email (login)
User.createIndex({ email: 1 });

// Role-based queries
User.createIndex({ role: 1, classId: 1 });

// Class lookups by teacher
Class.createIndex({ teacherId: 1 });

// Session queries
Session.createIndex({ classId: 1, scheduledAt: -1 });
Session.createIndex({ livekitRoomId: 1 });

// Attendance reports
Attendance.createIndex({ studentId: 1, date: -1 });
Attendance.createIndex({ sessionId: 1, studentId: 1 }, { unique: true });

// Material searches
Material.createIndex({ classId: 1, subjectId: 1 });
Material.createIndex({ tags: 1 });

// Message history
Message.createIndex({ userId: 1, createdAt: -1 });
Message.createIndex({ sessionId: 1, createdAt: 1 });
```

---

## Sample Data

### Sample User (Teacher)
```json
{
  "name": "Dr. Priya Sharma",
  "email": "priya.sharma@school.edu",
  "role": "teacher",
  "language": "hi",
  "preferences": {
    "theme": "light",
    "notifications": true,
    "emailAlerts": true
  },
  "points": 1500,
  "badges": ["expert_educator", "tech_savvy"]
}
```

### Sample Class
```json
{
  "name": "Physics Advanced",
  "grade": "Class 12",
  "section": "A",
  "academicYear": "2025-26",
  "maxStudents": 40,
  "schedule": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": "..."
    }
  ]
}
```

### Sample Quiz
```json
{
  "title": "Newton's Laws Quiz",
  "questions": [
    {
      "question": "What is Newton's First Law?",
      "options": [
        "F = ma",
        "An object at rest stays at rest unless acted upon",
        "Action = Reaction",
        "E = mc²"
      ],
      "correctAnswer": 1,
      "explanation": "Newton's First Law is the Law of Inertia",
      "points": 2
    }
  ],
  "duration": 30,
  "totalPoints": 20,
  "passingScore": 60
}
```

---

## Migration Scripts

```typescript
// scripts/migrations/001_add_gamification.ts
import mongoose from 'mongoose';
import User from '@/models/User';

export async function addGamificationFields() {
  await User.updateMany(
    { points: { $exists: false } },
    { $set: { points: 0, badges: [] } }
  );
  
  console.log('✅ Added gamification fields to all users');
}
```

---

## Backup Strategy

```bash
# Daily backup
mongodump --uri="mongodb+srv://..." --out="/backups/$(date +%Y%m%d)"

# Restore
mongorestore --uri="mongodb+srv://..." "/backups/20260213"
```
