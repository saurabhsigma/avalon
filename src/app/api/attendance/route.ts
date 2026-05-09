import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    if (classId) {
      query.classId = classId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('sessionId', 'title scheduledAt status')
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

      const classData = await Class.findOne({ _id: classId, teacherId: decoded.userId });
      if (!classData) {
        return NextResponse.json({ error: 'You can only mark attendance for your own class' }, { status: 403 });
      }

      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      let session = await Session.findOne({
        classId,
        teacherId: decoded.userId,
        scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ scheduledAt: -1 });

      if (!session) {
        let subjectId = classData.subjects?.[0];

        if (!subjectId) {
          const manualSubject = await Subject.findOneAndUpdate(
            { classId, teacherId: decoded.userId, name: 'General Attendance' },
            {
              $setOnInsert: {
                name: 'General Attendance',
                classId,
                teacherId: decoded.userId,
                description: 'Auto-created subject for manual attendance',
                color: '#22c55e',
              },
            },
            { upsert: true, new: true }
          );

          subjectId = manualSubject._id;
          await Class.findByIdAndUpdate(classId, { $addToSet: { subjects: subjectId } });
        }

        const dateKey = targetDate.toISOString().split('T')[0];
        const livekitRoomId = `manual-attendance-${classId}-${dateKey}`;

        session = await Session.findOneAndUpdate(
          { livekitRoomId },
          {
            $setOnInsert: {
              title: `Manual Attendance - ${dateKey}`,
              classId,
              subjectId,
              teacherId: decoded.userId,
              livekitRoomId,
              scheduledAt: targetDate,
              duration: 0,
              description: 'Auto-created manual attendance session',
              status: 'completed',
            },
          },
          { upsert: true, new: true }
        );
      }

      const updates = [];
      const attendanceMapAny = attendanceMap as Record<string, boolean>;
      for (const [studentId, isPresent] of Object.entries(attendanceMapAny)) {
        updates.push({
          updateOne: {
            filter: { sessionId: session!._id, studentId },
            update: {
              $set: {
                status: (isPresent ? 'present' : 'absent') as 'present' | 'absent',
                classId: session!.classId,
                subjectId: session!.subjectId,
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
