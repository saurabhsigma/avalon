import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
  }[];
  score: number;
  totalMarks: number;
  passed: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema: Schema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [{
      questionIndex: {
        type: Number,
        required: true,
      },
      selectedAnswer: {
        type: Number,
        required: true,
      },
    }],
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup of student attempts
QuizAttemptSchema.index({ studentId: 1, quizId: 1 });

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
