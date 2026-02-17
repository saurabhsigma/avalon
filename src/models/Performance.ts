import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformance extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  attemptedAt: Date;
}

const PerformanceSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
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
      isCorrect: {
        type: Boolean,
        required: true,
      },
    }],
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

PerformanceSchema.index({ studentId: 1, subjectId: 1 });
PerformanceSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Performance || mongoose.model<IPerformance>('Performance', PerformanceSchema);
