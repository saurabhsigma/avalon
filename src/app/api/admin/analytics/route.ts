import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Class from '@/models/Class';
import Session from '@/models/Session';
import Quiz from '@/models/Quiz';
import Attendance from '@/models/Attendance';
import { verify } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get counts
    const [teacherCount, studentCount, classCount, sessionCount, quizCount] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Class.countDocuments(),
      Session.countDocuments(),
      Quiz.countDocuments(),
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role isActive lastLogin createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get all teachers with their classes
    const teachers = await User.find({ role: 'teacher' })
      .select('name email isActive lastLogin createdAt')
      .lean();

    const teachersWithClasses = await Promise.all(
      teachers.map(async (teacher) => {
        const classCount = await Class.countDocuments({ teacher: teacher._id });
        const sessionCount = await Session.countDocuments({ teacher: teacher._id });
        return {
          ...teacher,
          classCount,
          sessionCount,
        };
      })
    );

    // Get all students with their attendance
    const students = await User.find({ role: 'student' })
      .select('name email classId isActive lastLogin createdAt')
      .populate('classId', 'name')
      .lean();

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const attendanceRecords = await Attendance.find({
          studentId: student._id,
        });
        
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter((record) => record.status === 'present').length;

        const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

        return {
          ...student,
          attendanceRate,
        };
      })
    );

    // Activity statistics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyLogins, monthlyLogins, activeSessions] = await Promise.all([
      User.countDocuments({ lastLogin: { $gte: oneWeekAgo } }),
      User.countDocuments({ lastLogin: { $gte: oneMonthAgo } }),
      Session.countDocuments({ status: 'live' }),
    ]);

    return NextResponse.json({
      overview: {
        teachers: teacherCount,
        students: studentCount,
        classes: classCount,
        sessions: sessionCount,
        quizzes: quizCount,
        weeklyLogins,
        monthlyLogins,
        activeSessions,
      },
      recentUsers,
      teachers: teachersWithClasses,
      students: studentsWithStats,
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
