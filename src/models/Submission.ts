import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  submittedAt?: Date
  fileUrl?: string
  comment?: string
  score?: number
  status: 'submitted' | 'late' | 'missing'
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date },
    fileUrl: String,
    comment: String,
    score: Number,
    status: { type: String, enum: ['submitted', 'late', 'missing'], default: 'missing' },
  },
  { timestamps: true }
)

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission
