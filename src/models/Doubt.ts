import mongoose, { Schema, Document } from 'mongoose';

export interface IDoubt extends Document {
  question: string;
  description?: string;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  status: 'open' | 'answered' | 'resolved';
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  answeredAt?: Date;
  aiResponse?: string;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema: Schema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'resolved'],
      default: 'open',
    },
    answer: {
      type: String,
    },
    answeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    answeredAt: {
      type: Date,
    },
    aiResponse: {
      type: String,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

DoubtSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
DoubtSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.models.Doubt || mongoose.model<IDoubt>('Doubt', DoubtSchema);
