import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Assign student to class
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { studentId, classId } = await req.json();

    if (!studentId || !classId) {
      return NextResponse.json({ error: 'Student ID and Class ID are required' }, { status: 400 });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify student exists and is a student
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    if (student.role !== 'student') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 });
    }

    // Assign student to class
    student.classId = classId;
    await student.save();

    return NextResponse.json({ message: 'Student assigned to class successfully', student }, { status: 200 });
  } catch (error: any) {
    console.error('Assign student error:', error);
    return NextResponse.json({ error: 'Failed to assign student' }, { status: 500 });
  }
}

// Get all students with their class assignments
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const students = await User.find({ role: 'student' })
      .populate('classId', 'name')
      .select('name email classId isActive createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Failed to get students' }, { status: 500 });
  }
}
