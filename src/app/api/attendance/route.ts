import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get attendance records
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    let query: any = {};

    // Students can only see their own attendance
    if (decoded.role === 'student') {
      query.studentId = decoded.userId;
    } else if (decoded.role === 'teacher' && studentId) {
      query.studentId = studentId;
    }

    if (sessionId) {
      query.sessionId = sessionId;
    }

    const attendance = await Attendance.find(query)
      .populate('sessionId', 'title scheduledAt')
      .populate('studentId', 'name email')
      .sort({ joinTime: -1 });

    // Calculate statistics
    const stats = {
      totalSessions: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      averageDuration: attendance.length > 0
        ? Math.round(attendance.reduce((sum, a) => sum + (a.duration || 0), 0) / attendance.length)
        : 0,
    };

    return NextResponse.json({ attendance, stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Failed to get attendance' }, { status: 500 });
  }
}

// Manual attendance marking (for teachers)
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

    const body = await req.json();
    // Check if this is a bulk update from TeacherAttendancePage
    if (body.classId && body.date && body.attendance) {
      const { classId, date, attendance: attendanceMap } = body;

      // Find a session for this class on this date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find the most recent session for this day to mark attendance against
      const session = await Session.findOne({
        classId,
        scheduledAt: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ scheduledAt: -1 });

      if (!session) {
        return NextResponse.json(
          { error: 'No session found for this date. Please create a session first.' },
          { status: 404 }
        );
      }

      const updates = [];
      const attendanceMapAny = attendanceMap as Record<string, boolean>;
      for (const [studentId, isPresent] of Object.entries(attendanceMapAny)) {
        updates.push({
          updateOne: {
            filter: { sessionId: session._id, studentId },
            update: {
              $set: {
                status: (isPresent ? 'present' : 'absent') as 'present' | 'absent',
                classId: session.classId,
                subjectId: session.subjectId,
                date: targetDate,
                updatedAt: new Date()
              },
              $setOnInsert: {
                joinTime: new Date(),
                duration: 0,
                isAutoMarked: false,
                createdAt: new Date()
              }
            },
            upsert: true
          }
        });
      }

      if (updates.length > 0) {
        await Attendance.bulkWrite(updates);
      }

      return NextResponse.json({ message: 'Attendance saved successfully' }, { status: 200 });
    }

    // Single student update fallback
    const { sessionId, studentId, status } = body;

    if (!sessionId || !studentId || !status) {
      return NextResponse.json(
        { error: 'Session ID, studentId, and status are required for single update' },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to teacher
    const session = await Session.findOne({
      _id: sessionId,
      teacherId: decoded.userId,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({ sessionId, studentId });

    if (attendance) {
      // Update existing attendance
      attendance.status = status;
      attendance.isAutoMarked = false;
      await attendance.save();
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        sessionId,
        studentId,
        status,
        classId: session.classId,
        subjectId: session.subjectId,
        date: new Date(),
        isAutoMarked: false,
        joinTime: new Date(),
        duration: 0,
      });
    }

    return NextResponse.json(
      { message: 'Attendance marked successfully', attendance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Mark attendance error:', error);
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}
