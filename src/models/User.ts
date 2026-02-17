import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'teacher' | 'student' | 'admin'
  classId?: mongoose.Types.ObjectId
  avatar?: string
  language: 'en' | 'hi' | 'es' | 'fr'
  isActive: boolean
  lastLogin?: Date
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    emailAlerts: boolean
  }
  points: number
  badges: string[]
  createdAt: Date
  updatedAt: Date
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
      select: false,
    },
    role: {
      type: String,
      enum: ['teacher', 'student', 'admin'],
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    avatar: String,
    language: {
      type: String,
      enum: ['en', 'hi', 'es', 'fr'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
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
    },
    badges: [String],
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, classId: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
