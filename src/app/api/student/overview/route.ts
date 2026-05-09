/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import TopicProgress from '@/models/TopicProgress';
import Subject from '@/models/Subject';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    // Attendance stats for student
    const attendanceRecords = await Attendance.find({ studentId: decoded.userId }).lean();
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

    // Assignments for student's class (need to get classId from User)
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId).lean();
    let assignmentsTotal = 0;
    let assignmentsPending = 0;
    if (user?.classId) {
      const assignments = await Assignment.find({ classId: user.classId }).lean();
      assignmentsTotal = assignments.length;
      if (assignmentsTotal > 0) {
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({ assignmentId: { $in: assignmentIds }, studentId: decoded.userId }).lean();
        const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
        assignmentsPending = Math.max(0, assignmentsTotal - submittedCount);
      }
    }

    const topicProgress = await TopicProgress.find({ studentId: decoded.userId }).lean();
    const perfRecords = topicProgress.length === 0
      ? await Performance.find({ studentId: decoded.userId }).lean()
      : [];
    const avgGrade = topicProgress.length > 0
      ? Math.round((topicProgress.reduce((sum, row) => sum + (row.bestPercentage || 0), 0) / topicProgress.length) * 10) / 10
      : perfRecords.length > 0
        ? Math.round((perfRecords.reduce((a, p) => a + (p.percentage || 0), 0) / perfRecords.length) * 10) / 10
        : 0;

    const subjects = user?.classId ? await Subject.find({ classId: user.classId }).select('name color roadmap').lean() : [];
    const subjectsProgress = subjects.map((subject: any) => {
      const subjectRows = topicProgress.filter((row: any) => row.subjectId.toString() === subject._id.toString());
      const totalCredits = (subject.roadmap?.topics || []).reduce((sum: number, topic: any) => sum + (topic.estimatedCredits || 0), 0);
      const earnedCredits = subjectRows.reduce((sum: number, row: any) => sum + (row.creditsEarned || 0), 0);
      const masteredTopics = subjectRows.filter((row: any) => row.mastered).length;
      return {
        subjectId: subject._id.toString(),
        name: subject.name,
        color: subject.color,
        topicCount: subject.roadmap?.topics?.length || 0,
        masteredTopics,
        earnedCredits,
        totalCredits,
      };
    });

    const creditsEarned = topicProgress.reduce((sum, row) => sum + (row.creditsEarned || 0), 0);
    const topicsMastered = topicProgress.filter((row) => row.mastered).length;

    // Get recent quiz attempts
    const QuizAttempt = (await import('@/models/QuizAttempt')).default;
    const recentAttempts = await QuizAttempt.find({ studentId: decoded.userId })
      .populate('quizId', 'title topicTitle')
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      attendance: attendancePct,
      avgGrade,
      assignmentsTotal,
      assignmentsPending,
      creditsEarned,
      topicsMastered,
      roadmapSubjects: subjectsProgress,
      recentAttempts,
      topicProgress: topicProgress.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Student overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}
