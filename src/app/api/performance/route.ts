import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Performance from '@/models/Performance';
import Quiz from '@/models/Quiz';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Submit quiz and calculate score
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit quizzes' }, { status: 403 });
    }

    await connectDB();

    const { quizId, answers, timeTaken } = await req.json();

    if (!quizId || !answers || !timeTaken) {
      return NextResponse.json(
        { error: 'Quiz ID, answers, and time taken are required' },
        { status: 400 }
      );
    }

    // Get quiz with questions
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if already attempted
    const existingPerformance = await Performance.findOne({
      quizId,
      studentId: decoded.userId,
    });

    if (existingPerformance) {
      return NextResponse.json(
        { error: 'Quiz already attempted' },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    const marksPerQuestion = quiz.totalMarks / quiz.questions.length;
    const processedAnswers = quiz.questions.map((question: any, index: number) => {
      const studentAnswer = answers[index];
      const isCorrect = studentAnswer === question.correctAnswer;
      if (isCorrect) {
        score += marksPerQuestion;
      }
      return {
        questionIndex: index,
        selectedAnswer: studentAnswer,
        isCorrect,
      };
    });

    const percentage = (score / quiz.totalMarks) * 100;

    // Save performance
    const performance = await Performance.create({
      studentId: decoded.userId,
      quizId,
      subjectId: quiz.subjectId,
      score: Math.round(score * 100) / 100,
      totalMarks: quiz.totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      timeTaken,
      answers: processedAnswers,
      attemptedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Quiz submitted successfully',
        performance: {
          score: performance.score,
          totalMarks: performance.totalMarks,
          percentage: performance.percentage,
          passed: performance.percentage >= (quiz.passingMarks / quiz.totalMarks * 100),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}

// Get student performance
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const studentId = searchParams.get('studentId');

    let query: any = {};
    
    // Students can only see their own performance
    if (decoded.role === 'student') {
      query.studentId = decoded.userId;
    } else if (decoded.role === 'teacher' && studentId) {
      query.studentId = studentId;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const performances = await Performance.find(query)
      .populate('quizId', 'title totalMarks passingMarks')
      .populate('subjectId', 'name color')
      .sort({ attemptedAt: -1 });

    return NextResponse.json({ performances }, { status: 200 });
  } catch (error: any) {
    console.error('Get performance error:', error);
    return NextResponse.json({ error: 'Failed to get performance' }, { status: 500 });
  }
}
