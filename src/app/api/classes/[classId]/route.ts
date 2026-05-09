import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Class from '@/models/Class';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import Subject from '@/models/Subject';
import Material from '@/models/Material';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

type RouteContext = {
  params: Promise<{ classId: string }>;
};

async function getAccess(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  return { decoded };
}

async function findOwnedClass(classId: string, decoded: { userId: string; role: string }) {
  const classData = await Class.findById(classId);

  if (!classData) {
    return { error: NextResponse.json({ error: 'Class not found' }, { status: 404 }) };
  }

  if (decoded.role !== 'admin' && decoded.role !== 'teacher') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
  }

  if (decoded.role === 'teacher' && classData.teacherId.toString() !== decoded.userId) {
    return { error: NextResponse.json({ error: 'You can only delete your own classes' }, { status: 403 }) };
  }

  return { classData };
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const access = await getAccess(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();
    const { classId } = await context.params;

    const owned = await findOwnedClass(classId, access.decoded);
    if ('error' in owned) {
      return owned.error;
    }

    await Promise.all([
      Session.deleteMany({ classId }),
      Attendance.deleteMany({ classId }),
      Subject.deleteMany({ classId }),
      Material.deleteMany({ classId }),
      User.updateMany({ classId }, { $unset: { classId: '' } }),
      Class.findByIdAndDelete(classId),
    ]);

    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}