import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    const studentId = searchParams.get('studentId') || decoded.userId;

    let query: any = { studentId };
    if (quizId) {
      query.quizId = quizId;
    }

    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title totalMarks passingMarks')
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    return NextResponse.json({ attempts });
  } catch (error: any) {
    console.error('Error fetching attempts:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Only students can attempt quizzes' }, { status: 403 });
    }

    const { quizId, answers } = await req.json();

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'Quiz ID and answers required' }, { status: 400 });
    }

    // Get quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    answers.forEach((ans: any) => {
      const question = quiz.questions[ans.questionIndex];
      if (question && question.correctAnswer === ans.selectedAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * quiz.totalMarks);
    const passed = score >= quiz.passingMarks;

    // Save attempt
    const attempt = await QuizAttempt.create({
      quizId,
      studentId: decoded.userId,
      answers,
      score,
      totalMarks: quiz.totalMarks,
      passed,
    });

    return NextResponse.json({
      attempt,
      score,
      totalMarks: quiz.totalMarks,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting attempt:', error);
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 });
  }
}
