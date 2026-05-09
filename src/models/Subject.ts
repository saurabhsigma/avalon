import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  description?: string;
  color: string;
  icon?: string;
  roadmap?: {
    generatedAt?: Date;
    classLabel?: string;
    learningTheme?: string;
    topics: {
      title: string;
      description: string;
      order: number;
      difficulty: 'foundation' | 'core' | 'advanced';
      estimatedCredits: number;
      villageName: string;
      masteryThreshold: number;
    }[];
  };
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    icon: {
      type: String,
    },
    roadmap: {
      generatedAt: Date,
      classLabel: String,
      learningTheme: String,
      topics: [{
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        order: {
          type: Number,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ['foundation', 'core', 'advanced'],
          default: 'core',
        },
        estimatedCredits: {
          type: Number,
          default: 10,
        },
        villageName: {
          type: String,
          required: true,
          trim: true,
        },
        masteryThreshold: {
          type: Number,
          default: 70,
        },
      }],
    },
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: String,
      endTime: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index: same subject name can exist in different classes
SubjectSchema.index({ name: 1, classId: 1 }, { unique: true });
SubjectSchema.index({ classId: 1, teacherId: 1 });

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
