import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  coverPhoto: string;
  link?: string;
  organizerId: mongoose.Types.ObjectId;
  organizerModel: 'User';
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  coverPhoto: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    trim: true,
  },
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizerModel: {
    type: String,
    default: 'User',
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  score: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Update score whenever upvotes/downvotes change
EventSchema.pre('save', function() {
  this.score = this.upvotes.length - this.downvotes.length;
});

// Index for efficient sorting
EventSchema.index({ score: -1, createdAt: -1 });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
