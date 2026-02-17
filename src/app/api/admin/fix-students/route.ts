import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Fix students without class assignment
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

    // Find first class
    const firstClass = await Class.findOne().sort({ createdAt: 1 });
    if (!firstClass) {
      return NextResponse.json({ error: 'No classes found. Please create a class first.' }, { status: 404 });
    }

    // Find all students without classId
    const studentsWithoutClass = await User.find({ 
      role: 'student',
      $or: [
        { classId: null },
        { classId: { $exists: false } }
      ]
    });

    // Assign them to the first class
    const updatePromises = studentsWithoutClass.map(student => {
      student.classId = firstClass._id;
      return student.save();
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: `Fixed ${studentsWithoutClass.length} students`,
      count: studentsWithoutClass.length,
      assignedTo: firstClass.name
    }, { status: 200 });
  } catch (error: any) {
    console.error('Fix students error:', error);
    return NextResponse.json({ error: 'Failed to fix students' }, { status: 500 });
  }
}
