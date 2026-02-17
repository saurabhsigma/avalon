import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Subject from '@/models/Subject';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get all subjects
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    let query: any = {};
    
    // Teachers can only see their subjects
    if (decoded.role === 'teacher') {
      query.teacherId = decoded.userId;
    }
    
    // Students and teachers can filter by classId
    if (classId) {
      query.classId = classId;
    }

    const subjects = await Subject.find(query)
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error: any) {
    console.error('Get subjects error:', error);
    return NextResponse.json({ error: 'Failed to get subjects' }, { status: 500 });
  }
}

// Create new subject
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

    const { name, classId, description, color, icon } = await req.json();

    if (!name || !classId) {
      return NextResponse.json(
        { error: 'Name and classId are required' },
        { status: 400 }
      );
    }

    // Verify class belongs to teacher
    const classExists = await Class.findOne({
      _id: classId,
      teacherId: decoded.userId,
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      );
    }

    const subject = await Subject.create({
      name,
      classId,
      teacherId: decoded.userId,
      description,
      color: color || '#6366F1',
      icon,
    });

    // Add subject to class
    await Class.findByIdAndUpdate(classId, {
      $push: { subjects: subject._id },
    });

    return NextResponse.json(
      { message: 'Subject created successfully', subject },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
