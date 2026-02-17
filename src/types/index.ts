export interface User {
  _id: string
  name: string
  email: string
  role: 'teacher' | 'student'
  classId?: string
  avatar?: string
  language: string
  points: number
  badges: string[]
}

export interface Class {
  _id: string
  name: string
  grade: string
  section?: string
  teacherId: string
  subjects: string[]
  students: string[]
  academicYear: string
  description?: string
  maxStudents: number
  isActive: boolean
}

export interface Session {
  _id: string
  title: string
  classId: string
  subjectId: string
  teacherId: string
  livekitRoomId: string
  scheduledAt: Date
  startedAt?: Date
  endedAt?: Date
  duration: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  description?: string
}

export interface Attendance {
  _id: string
  classId: string
  sessionId: string
  studentId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  joinTime?: Date
  leaveTime?: Date
  duration: number
  date: Date
}
