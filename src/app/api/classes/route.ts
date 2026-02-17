import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get all classes for teacher
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('id');

    // If specific class ID is requested
    if (classId) {
      const classData = await Class.findById(classId)
        .populate('students', 'name email avatar')
        .populate('subjects')
        .populate('teacherId', 'name email');
      
      if (!classData) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      
      return NextResponse.json({ class: classData }, { status: 200 });
    }

    let query: any = {};
    if (decoded.role === 'teacher') {
      query.teacherId = decoded.userId;
    } else if (decoded.role === 'student') {
      const User = require('@/models/User').default;
      const user = await User.findById(decoded.userId);
      if (user && user.classId) {
        // If already enrolled, only show their class
        query._id = user.classId;
      }
      // If not enrolled, query remains empty -> fetch all classes (to allow joining)
    }

    const classes = await Class.find(query)
      .populate('students', 'name email avatar')
      .populate('subjects')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    const classesWithEnrollment = classes.map(cls => {
      const clsObj = cls.toObject() as any;
      if (decoded.role === 'student') {
        clsObj.isEnrolled = cls.students.some((s: any) => s._id.toString() === decoded.userId);
      }
      return clsObj;
    });

    return NextResponse.json({ classes: classesWithEnrollment }, { status: 200 });
  } catch (error: any) {
    console.error('Get classes error:', error);
    return NextResponse.json({ error: 'Failed to get classes' }, { status: 500 });
  }
}

// Create new class
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

    const { name, grade, section, description, schedule } = await req.json();

    if (!name || !grade) {
      return NextResponse.json({ error: 'Name and grade are required' }, { status: 400 });
    }

    // Calculate academic year (e.g. 2023-2024)
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const newClass = await Class.create({
      name,
      grade,
      section,
      description,
      teacherId: decoded.userId,
      academicYear,
      schedule: schedule || [],
      students: [],
      subjects: [],
    });

    return NextResponse.json(
      { message: 'Class created successfully', class: newClass },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create class error:', error);
    
    // Handle duplicate class name error
    if (error.code === 11000 && error.keyPattern?.name) {
      return NextResponse.json({ error: 'A class with this name already exists. Please use a different name.' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
