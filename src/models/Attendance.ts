import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendance extends Document {
  classId: mongoose.Types.ObjectId
  subjectId: mongoose.Types.ObjectId
  sessionId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  status: 'present' | 'absent' | 'late' | 'excused'
  joinTime?: Date
  leaveTime?: Date
  duration: number
  isAutoMarked: boolean
  remarks?: string
  date: Date
  createdAt: Date
  updatedAt: Date
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
    joinTime: Date,
    leaveTime: Date,
    duration: {
      type: Number,
      default: 0,
    },
    isAutoMarked: {
      type: Boolean,
      default: true,
    },
    remarks: String,
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true })
AttendanceSchema.index({ studentId: 1, date: -1 })
AttendanceSchema.index({ classId: 1, date: -1 })

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)

export default Attendance
