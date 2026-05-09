/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import Subject from '@/models/Subject';
import TopicProgress from '@/models/TopicProgress';
import { getSubjectTopicStats } from '@/lib/topicProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get('days') || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get classes for teacher
    const classes = await Class.find({ teacherId: decoded.userId }).populate('students', 'name email').lean();

    const Assignment = (await import('@/models/Assignment')).default;
    const Submission = (await import('@/models/Submission')).default;

    const classSummaries = await Promise.all(classes.map(async (cls: any) => {
      // Attendance counts for period
      const attendanceRecords = await Attendance.find({ classId: cls._id, date: { $gte: since } }).lean();

      const byStudent: Record<string, { present: number; total: number }> = {};
      attendanceRecords.forEach((rec: any) => {
        const sid = rec.studentId?.toString?.() || String(rec.studentId);
        if (!byStudent[sid]) byStudent[sid] = { present: 0, total: 0 };
        byStudent[sid].total += 1;
        if (rec.status === 'present') byStudent[sid].present += 1;
      });

      const studentsSummary = (cls.students || []).map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        attendanceRate: (() => {
          const stats = byStudent[s._id.toString()] || { present: 0, total: 0 };
          return stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        })(),
        testAvg: null as number | null,
        assignmentCompletion: null as number | null,
      }));

      const classSubjectIds = (cls.subjects || []).map((subjectId: any) => subjectId.toString());

      // Compute average performance per student for subjects in this class
      for (const st of studentsSummary) {
        const topicRows: any[] = await TopicProgress.find({
          studentId: st.id,
          subjectId: { $in: cls.subjects || [] },
        }).lean();
        const perfs: any[] = topicRows.length === 0
          ? await Performance.find({ studentId: st.id, subjectId: { $in: cls.subjects || [] } }).lean()
          : [];
        st.testAvg = topicRows.length > 0
          ? Math.round((topicRows.reduce((a, p) => a + (p.bestPercentage || 0), 0) / topicRows.length) * 10) / 10
          : perfs.length > 0
            ? Math.round((perfs.reduce((a, p) => a + (p.percentage || 0), 0) / perfs.length) * 10) / 10
            : null;

        // Assignment completion
        const assignments = await Assignment.find({ classId: cls._id }).lean();
        if (assignments.length > 0) {
          const assignmentIds = assignments.map(a => a._id);
          const subs = await Submission.find({ assignmentId: { $in: assignmentIds }, studentId: st.id }).lean();
          const completed = subs.filter(su => su.status === 'submitted' || su.status === 'late').length;
          st.assignmentCompletion = Math.round((completed / assignments.length) * 100);
        } else {
          st.assignmentCompletion = null;
        }
      }

      const classAttendanceAvg = studentsSummary.length > 0
        ? Math.round(studentsSummary.reduce((a: number, s: any) => a + s.attendanceRate, 0) / studentsSummary.length)
        : 0;

      const classTestAvg = (() => {
        const vals = studentsSummary.map((s: any) => s.testAvg).filter((v: any) => v !== null && v !== undefined);
        return vals.length > 0 ? Math.round((vals.reduce((a: number, v: number) => a + v, 0) / vals.length) * 10) / 10 : null;
      })();

      return {
        id: cls._id,
        name: cls.name,
        subjectIds: classSubjectIds,
        studentsCount: (cls.students || []).length,
        classAttendanceAvg,
        classTestAvg,
        students: studentsSummary,
      };
    }));

    // High-level totals
    const totalClasses = classSummaries.length;
    const totalStudents = classSummaries.reduce((a: number, c: any) => a + c.studentsCount, 0);
    const avgAttendance = classSummaries.length > 0 ? Math.round(classSummaries.reduce((a: number, c: any) => a + c.classAttendanceAvg, 0) / classSummaries.length) : 0;

    // Upcoming sessions count
    const now = new Date();
    const upcomingSessions = await (await import('@/models/Session')).default.countDocuments({ teacherId: decoded.userId, scheduledAt: { $gte: now }, status: { $ne: 'completed' } });

    const subjects = await Subject.find({ teacherId: decoded.userId })
      .populate('classId', 'name grade section')
      .sort({ createdAt: -1 })
      .lean();

    const subjectRoadmaps = await Promise.all(
      subjects
        .filter((subject: any) => subject.roadmap?.topics?.length)
        .map(async (subject: any) => ({
          subjectId: subject._id.toString(),
          subjectName: subject.name,
          color: subject.color,
          className: subject.classId?.name || 'Class',
          learningTheme: subject.roadmap?.learningTheme || '',
          topicStats: await getSubjectTopicStats(subject._id.toString()),
        }))
    );

    return NextResponse.json({ classes: classSummaries, totalClasses, totalStudents, avgAttendance, upcomingSessions, subjectRoadmaps }, { status: 200 });
  } catch (error: any) {
    console.error('Teacher overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}
