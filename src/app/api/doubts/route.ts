import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Doubt from '@/models/Doubt';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get doubts
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('sessionId');

    let query: any = {};
    
    // Students see their own doubts
    if (decoded.role === 'student') {
      query.studentId = decoded.userId;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }
    if (status) {
      query.status = status;
    }
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const doubts = await Doubt.find(query)
      .populate('studentId', 'name email avatar')
      .populate('subjectId', 'name color')
      .populate('answeredBy', 'name')
      .populate('sessionId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ doubts }, { status: 200 });
  } catch (error: any) {
    console.error('Get doubts error:', error);
    return NextResponse.json({ error: 'Failed to get doubts' }, { status: 500 });
  }
}

// Create new doubt
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Only students can post doubts' }, { status: 403 });
    }

    await connectDB();

    const { question, description, subjectId, sessionId, aiResponse } = await req.json();

    if (!question || !subjectId) {
      return NextResponse.json(
        { error: 'Question and subject ID are required' },
        { status: 400 }
      );
    }

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    const doubt = await Doubt.create({
      question,
      description,
      studentId: decoded.userId,
      subjectId,
      sessionId,
      aiResponse,
      status: 'open',
      upvotes: 0,
    });

    return NextResponse.json(
      { message: 'Doubt posted successfully', doubt },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create doubt error:', error);
    return NextResponse.json({ error: 'Failed to create doubt' }, { status: 500 });
  }
}

// Answer a doubt (teachers)
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can answer doubts' }, { status: 403 });
    }

    await connectDB();

    const { doubtId, answer } = await req.json();

    
    if (!doubtId || !answer) {
      return NextResponse.json(
        { error: 'Doubt ID and answer are required' },
        { status: 400 }
      );
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return NextResponse.json(
        { error: 'Doubt not found' },
        { status: 404 }
      );
    }

    doubt.answer = answer;
    doubt.answeredBy = decoded.userId;
    doubt.answeredAt = new Date();
    doubt.status = 'answered';
    await doubt.save();

    return NextResponse.json(
      { message: 'Doubt answered successfully', doubt },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Answer doubt error:', error);
    return NextResponse.json({ error: 'Failed to answer doubt' }, { status: 500 });
  }
}
