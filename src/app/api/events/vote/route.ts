import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST - Vote on an event
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await dbConnect();

    const { eventId, voteType } = await req.json();

    if (!eventId || !voteType) {
      return NextResponse.json({ error: 'Event ID and vote type are required' }, { status: 400 });
    }

    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const userId = decoded.userId;
    const hasUpvoted = event.upvotes.includes(userId);
    const hasDownvoted = event.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        event.upvotes = event.upvotes.filter((id: any) => id.toString() !== userId);
      } else {
        // Add upvote and remove downvote if exists
        event.upvotes.push(userId);
        if (hasDownvoted) {
          event.downvotes = event.downvotes.filter((id: any) => id.toString() !== userId);
        }
      }
    } else {
      if (hasDownvoted) {
        // Remove downvote
        event.downvotes = event.downvotes.filter((id: any) => id.toString() !== userId);
      } else {
        // Add downvote and remove upvote if exists
        event.downvotes.push(userId);
        if (hasUpvoted) {
          event.upvotes = event.upvotes.filter((id: any) => id.toString() !== userId);
        }
      }
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizerId', 'name email role')
      .lean();

    return NextResponse.json({ 
      event: updatedEvent, 
      message: 'Vote recorded successfully',
      userVote: event.upvotes.includes(userId) ? 'upvote' : event.downvotes.includes(userId) ? 'downvote' : null
    });
  } catch (error) {
    console.error('Error voting on event:', error);
    return NextResponse.json({ error: 'Failed to vote on event' }, { status: 500 });
  }
}
