# Events Feature Setup 🎉

## Overview
The Events feature allows teachers, students, and admins to create and participate in community events with upvote/downvote functionality similar to HackerNews.

## Features
- ✅ Create events with title, description, date, time, cover photo, and optional link
- ✅ Upload cover photos using Cloudinary
- ✅ Upvote/downvote events
- ✅ Top 3 events displayed prominently
- ✅ Events sorted by score (upvotes - downvotes)
- ✅ Edit/delete your own events
- ✅ Admins can delete any event
- ✅ Playful doodly design consistent with the app

## Cloudinary Setup

### 1. Create Cloudinary Account
- Go to [Cloudinary](https://cloudinary.com/)
- Sign up for a free account

### 2. Get Your Cloud Name
- After login, you'll see your **Cloud name** in the dashboard
- Copy this value

### 3. Create Upload Preset
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set the preset name to: `classroom_events`
5. Set "Signing Mode" to: **Unsigned**
6. Set folder to: `classroom/events` (optional)
7. Save

### 4. Update Environment Variables
Add to your `.env` file:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
```

## Usage

### For All Users (Teacher/Student/Admin)
1. Navigate to **Events** from the sidebar
2. Click **Create Event** button
3. Fill in the form:
   - **Title**: Event name
   - **Description**: Event details
   - **Date**: Event date
   - **Time**: Event time
   - **Cover Photo**: Upload an image (max 5MB)
   - **Event Link**: Optional URL for event details/registration
4. Click **Create Event**

### Voting
- Click ⬆️ to upvote an event
- Click ⬇️ to downvote an event
- Your vote can be changed or removed

### Event Management
- **Organizers** can edit or delete their own events
- **Admins** can delete any event

## API Endpoints

### GET `/api/events`
Fetch all events sorted by score
```json
{
  "topEvents": [...],  // Top 3 events
  "otherEvents": [...], // Remaining events
  "allEvents": [...]    // All events combined
}
```

### POST `/api/events`
Create a new event
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2026-03-15",
  "time": "14:00",
  "coverPhoto": "https://cloudinary.com/...",
  "link": "https://example.com"
}
```

### PUT `/api/events`
Update an event (organizer only)
```json
{
  "eventId": "...",
  "title": "Updated Title",
  ...
}
```

### DELETE `/api/events?id=eventId`
Delete an event (organizer or admin)

### POST `/api/events/vote`
Vote on an event
```json
{
  "eventId": "...",
  "voteType": "upvote" | "downvote"
}
```

## Database Schema
```typescript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  time: String (required),
  coverPhoto: String (required),
  link: String (optional),
  organizerId: ObjectId (ref: User),
  upvotes: [ObjectId],
  downvotes: [ObjectId],
  score: Number (auto-calculated),
  createdAt: Date,
  updatedAt: Date
}
```

## Styling
The events feature uses the same playful doodly design as the rest of the app:
- Gradient backgrounds
- Rounded borders with shadows
- Fun colors and emojis
- Smooth animations
- Consistent Poppins font
