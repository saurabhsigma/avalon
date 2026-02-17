import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

// Public endpoint to fix students - remove in production!
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Find first class
    const firstClass = await Class.findOne().sort({ createdAt: 1 });
    if (!firstClass) {
      return NextResponse.json({ error: 'No classes found. Please create a class first.' }, { status: 404 });
    }

    // Find all students without classId
    const result = await User.updateMany(
      { 
        role: 'student',
        $or: [
          { classId: null },
          { classId: { $exists: false } }
        ]
      },
      { 
        $set: { classId: firstClass._id }
      }
    );

    return NextResponse.json({ 
      message: `Fixed ${result.modifiedCount} students`,
      count: result.modifiedCount,
      assignedTo: firstClass.name,
      classId: firstClass._id
    }, { status: 200 });
  } catch (error: any) {
    console.error('Fix students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
