import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISession extends Document {
  title: string
  classId: mongoose.Types.ObjectId
  subjectId: mongoose.Types.ObjectId
  teacherId: mongoose.Types.ObjectId
  livekitRoomId: string
  scheduledAt: Date
  startedAt?: Date
  endedAt?: Date
  duration: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  description?: string
  createdAt: Date
  updatedAt: Date
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
    startedAt: Date,
    endedAt: Date,
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    description: String,
  },
  {
    timestamps: true,
  }
)

SessionSchema.index({ classId: 1, scheduledAt: -1 })
SessionSchema.index({ teacherId: 1, status: 1 })
SessionSchema.index({ livekitRoomId: 1 })

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

export default Session
