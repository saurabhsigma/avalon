import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  description: string;
  links?: { label: string; url: string }[];
  postedBy: mongoose.Types.ObjectId;
  postedByRole: 'admin' | 'teacher';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'teachers' | 'students';
  attachments?: string[];
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    links: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedByRole: {
      type: String,
      enum: ['admin', 'teacher'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'teachers', 'students'],
      default: 'all',
    },
    attachments: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ priority: 1, isActive: 1 });

const Notice = mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
