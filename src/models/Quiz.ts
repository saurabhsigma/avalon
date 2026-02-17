import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description?: string;
  subjectId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isAIGenerated: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    questions: [{
      question: {
        type: String,
        required: true,
      },
      options: [{
        type: String,
        required: true,
      }],
      correctAnswer: {
        type: Number,
        required: true,
      },
      explanation: String,
    }],
    duration: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ subjectId: 1, createdAt: -1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
