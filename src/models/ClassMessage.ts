import mongoose, { Schema, Document } from 'mongoose';

export interface IClassMessage extends Document {
  classId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'teacher' | 'student';
  messageType: 'text' | 'file' | 'announcement';
  content: string;
  fileUrl?: string;
  fileName?: string;
  readBy: mongoose.Types.ObjectId[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassMessageSchema = new Schema<IClassMessage>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['teacher', 'student'],
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'announcement'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: String,
    fileName: String,
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ClassMessageSchema.index({ classId: 1, createdAt: -1 });

const ClassMessage = (mongoose.models.ClassMessage as mongoose.Model<IClassMessage>) || 
  mongoose.model<IClassMessage>('ClassMessage', ClassMessageSchema);

export default ClassMessage;
