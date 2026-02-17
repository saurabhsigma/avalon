import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Fetch all events (sorted by score and date)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');

    // Get single event
    if (eventId) {
      const event = await Event.findById(eventId)
        .populate('organizerId', 'name email role')
        .lean();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json({ event });
    }

    // Get all events sorted by score (top 3 first) then by date
    const events = await Event.find()
      .populate('organizerId', 'name email role')
      .sort({ score: -1, createdAt: -1 })
      .lean();

    // Separate top 3 and others
    const topEvents = events.slice(0, 3);
    const otherEvents = events.slice(3);

    return NextResponse.json({ topEvents, otherEvents, allEvents: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Create a new event
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, description, date, time, coverPhoto, link } = await req.json();

    if (!title || !description || !date || !time || !coverPhoto) {
      return NextResponse.json(
        { error: 'Title, description, date, time, and cover photo are required' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      coverPhoto,
      link,
      organizerId: user._id,
      organizerModel: 'User',
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizerId', 'name email role')
      .lean();

    return NextResponse.json({ event: populatedEvent, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT - Update an event
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await dbConnect();

    const { eventId, title, description, date, time, coverPhoto, link } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized to update this event' }, { status: 403 });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (time) event.time = time;
    if (coverPhoto) event.coverPhoto = coverPhoto;
    if (link !== undefined) event.link = link;

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizerId', 'name email role')
      .lean();

    return NextResponse.json({ event: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE - Delete an event
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is the organizer or admin
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (event.organizerId.toString() !== decoded.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to delete this event' }, { status: 403 });
    }

    await Event.findByIdAndDelete(eventId);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
