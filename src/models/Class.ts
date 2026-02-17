import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClass extends Document {
  name: string
  grade: string
  section?: string
  teacherId: mongoose.Types.ObjectId
  subjects: mongoose.Types.ObjectId[]
  students: mongoose.Types.ObjectId[]
  academicYear: string
  description?: string
  maxStudents: number
  isActive: boolean
  schedule: {
    day: string
    startTime: string
    endTime: string
    subjectId: mongoose.Types.ObjectId
  }[]
  createdAt: Date
  updatedAt: Date
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
    section: String,
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
    description: String,
    maxStudents: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schedule: [{
      day: String,
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
)

ClassSchema.index({ teacherId: 1 })
ClassSchema.index({ academicYear: 1, isActive: 1 })

const Class: Model<IClass> = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)

export default Class
