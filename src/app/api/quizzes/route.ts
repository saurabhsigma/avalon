/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get all quizzes
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('id');
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');

    const query: any = {};

    // If teacher, optionally filter by their creation? 
    // Actually, if a teacher is viewing a class, they should see all quizzes for that class/subject
    // ensuring collaboration if multiple teachers exist. 
    // But for now, let's keep it simple.

    if (decoded.role === 'teacher') {
      query.createdBy = decoded.userId;
    }

    if (quizId) {
      query._id = quizId;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    } else if (classId) {
      // Find subjects for this class
      const subjects = await Subject.find({ classId }).select('_id');
      const subjectIds = subjects.map((s: any) => s._id);
      query.subjectId = { $in: subjectIds };
    }

    if (topicId) {
      query.topicId = topicId;
    }

    if (sessionId) {
      query.sessionId = sessionId;
    }

    const quizzes = await Quiz.find(query)
      .populate('subjectId', 'name color')
      .populate('createdBy', 'name')
      .populate('sessionId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error: any) {
    console.error('Get quizzes error:', error);
    return NextResponse.json({ error: 'Failed to get quizzes' }, { status: 500 });
  }
}

// Create new quiz
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const {
      title,
      description,
      subjectId,
      topicId,
      topicTitle,
      sessionId,
      questions,
      duration,
      totalMarks,
      passingMarks,
      isAIGenerated
    } = await req.json();

    if (!title || !subjectId || !questions || !duration || !totalMarks) {
      return NextResponse.json(
        { error: 'Title, subjectId, questions, duration, and totalMarks are required' },
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

    const quiz = await Quiz.create({
      title,
      description,
      subjectId,
      topicId: topicId || undefined,
      topicTitle: topicTitle || undefined,
      sessionId,
      questions,
      duration,
      totalMarks,
      passingMarks: passingMarks || Math.floor(totalMarks * 0.4), // 40% default
      isAIGenerated: isAIGenerated || false,
      createdBy: decoded.userId,
    });

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('id');
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz id is required' }, { status: 400 });
    }

    const deleted = await Quiz.findOneAndDelete({ _id: quizId, createdBy: decoded.userId });
    if (!deleted) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Quiz deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete quiz error:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}
