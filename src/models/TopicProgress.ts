import mongoose, { Document, Schema } from 'mongoose';

export interface ITopicProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  topicTitle: string;
  villageName?: string;
  bestPercentage: number;
  latestPercentage: number;
  attemptsCount: number;
  mastered: boolean;
  creditsEarned: number;
  totalCredits: number;
  quizzesCompleted: number;
  lastQuizId?: mongoose.Types.ObjectId;
  lastAttemptAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TopicProgressSchema = new Schema<ITopicProgress>(
  {
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
    topicId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    topicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    villageName: {
      type: String,
      trim: true,
    },
    bestPercentage: {
      type: Number,
      default: 0,
    },
    latestPercentage: {
      type: Number,
      default: 0,
    },
    attemptsCount: {
      type: Number,
      default: 0,
    },
    mastered: {
      type: Boolean,
      default: false,
    },
    creditsEarned: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 10,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
    },
    lastQuizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    lastAttemptAt: Date,
  },
  {
    timestamps: true,
  }
);

TopicProgressSchema.index({ studentId: 1, subjectId: 1 });
TopicProgressSchema.index({ studentId: 1, subjectId: 1, topicId: 1 }, { unique: true });
TopicProgressSchema.index({ subjectId: 1, topicId: 1 });

export default mongoose.models.TopicProgress || mongoose.model<ITopicProgress>('TopicProgress', TopicProgressSchema);
