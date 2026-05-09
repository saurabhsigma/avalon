import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAssignment extends Document {
  title: string
  classId: mongoose.Types.ObjectId
  subjectId?: mongoose.Types.ObjectId
  dueDate?: Date
  totalMarks?: number
  createdBy: mongoose.Types.ObjectId
  description?: string
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    dueDate: Date,
    totalMarks: { type: Number, default: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: String,
  },
  { timestamps: true }
)

AssignmentSchema.index({ classId: 1, dueDate: 1 })

const Assignment: Model<IAssignment> = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema)

export default Assignment
