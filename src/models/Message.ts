import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  isAIResponse: boolean;
  metadata?: {
    language?: string;
    translatedFrom?: string;
  };
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isAIResponse: {
      type: Boolean,
      default: false,
    },
    metadata: {
      language: String,
      translatedFrom: String,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
