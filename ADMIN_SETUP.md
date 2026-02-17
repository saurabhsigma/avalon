# Admin System Setup

## Admin Features Added

### 1. Admin Role
- Added `admin` role to User model
- Admin credentials:
  - Email: `admin@gmail.com`
  - Password: `admin123`

### 2. Admin Dashboard (`/admin/dashboard`)
- Overview statistics (teachers, students, classes, sessions, quizzes)
- Activity metrics (weekly/monthly logins, active sessions)
- Recent users list
- Teacher analytics (classes count, sessions count per teacher)
- Student analytics (attendance rate per student)

### 3. Notice Board System

#### For Admin (`/admin/notices`):
- Create, view, and delete notices
- Notice fields:
  - Title
  - Description
  - Priority (low, medium, high, urgent)
  - Target audience (all, teachers only, students only)
  - Links (optional, multiple)
  - Expiry date (optional)
- School notice board aesthetic with colorful cards

#### For Teachers (`/teacher/notices`):
- View all notices targeted to teachers or all
- Cannot create/delete notices (only view)
- Same school notice board design

#### For Students (`/student/notices`):
- View all notices targeted to students or all
- Read-only access
- Same school notice board design

### 4. Navigation Updates
- Admin has separate navigation: Dashboard, Notices, Analytics
- Teachers have Notices added to sidebar
- Students have Notices added to sidebar

## Setup Instructions

### 1. Start Development Server
```bash
npm run dev
```

### 2. Seed Admin User
Once the server is running, execute this command in a new terminal:
```bash
curl -X POST http://localhost:3000/api/admin/seed
```

Or visit: `http://localhost:3000/api/admin/seed` in your browser

### 3. Login as Admin
- Go to `http://localhost:3000/login`
- Email: `admin@gmail.com`
- Password: `admin123`
- Will redirect to `/admin/dashboard`

## API Routes

### Admin APIs
- `POST /api/admin/seed` - Create admin user
- `GET /api/admin/analytics` - Get platform analytics (admin only)

### Notice APIs
- `GET /api/notices` - Get notices (filtered by user role)
- `POST /api/notices` - Create notice (admin/teacher only)
- `DELETE /api/notices?id={noticeId}` - Delete notice (admin/teacher only)

## Notice Board Features

### Visual Design
- School bulletin board aesthetic
- Color-coded priority badges:
  - 🔴 Urgent: Red
  - 🟠 High: Orange
  - 🟡 Medium: Yellow
  - 🔵 Low: Blue
- Doodle-style cards with borders
- Animated entry for each notice
- Posted by information with role badge
- Date display
- Expiry warnings for time-sensitive notices

### Notice Priority
Notices are sorted by:
1. Priority (urgent → high → medium → low)
2. Creation date (newest first)

### Target Audience
- **All**: Visible to both teachers and students
- **Teachers Only**: Only visible to teachers and admin
- **Students Only**: Only visible to students and admin

## Admin Analytics

The admin dashboard shows:
- Total counts (teachers, students, classes, sessions, quizzes)
- User activity (weekly active, monthly active, live sessions)
- Recent users with join dates
- Full teacher list with their class/session counts
- Full student list with attendance rates

All data is real-time and refreshes on page load.
