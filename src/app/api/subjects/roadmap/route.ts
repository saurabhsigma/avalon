/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import Class from '@/models/Class';
import Quiz from '@/models/Quiz';
import TopicProgress from '@/models/TopicProgress';
import { getSubjectTopicStats } from '@/lib/topicProgress';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });
    }

    await connectDB();

    const subject = await Subject.findById(subjectId)
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email')
      .lean();

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const quizzes = await Quiz.find({ subjectId })
      .select('title topicId topicTitle totalMarks questions duration createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const topics = subject.roadmap?.topics || [];
    const topicQuizMap = topics.map((topic: any) => {
      const topicIdStr = topic._id?.toString() || '';
      return {
        topicId: topicIdStr,
        quizzes: quizzes
          .filter((quiz: any) => quiz.topicId?.toString() === topicIdStr)
          .map((quiz: any) => ({
            id: quiz._id.toString(),
            title: quiz.title,
            topicTitle: quiz.topicTitle,
            totalMarks: quiz.totalMarks,
            questionCount: quiz.questions?.length || 0,
            duration: quiz.duration,
          })),
      };
    });

    if (decoded.role === 'teacher') {
      const topicStats = await getSubjectTopicStats(subjectId);
      return NextResponse.json({
        subject,
        topicStats,
        topicQuizMap,
      });
    }

    const progressRows = await TopicProgress.find({
      studentId: decoded.userId,
      subjectId,
    }).lean();

    const studentTopics = topics.map((topic: any) => {
      const topicIdStr = topic._id?.toString() || '';
      const progress = progressRows.find((row: any) => row.topicId?.toString() === topicIdStr);
      const quizEntry = topicQuizMap.find((entry: any) => entry.topicId === topicIdStr);
      return {
        topicId: topicIdStr,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        difficulty: topic.difficulty,
        villageName: topic.villageName,
        estimatedCredits: topic.estimatedCredits,
        masteryThreshold: topic.masteryThreshold,
        progress: progress
          ? {
              bestPercentage: progress.bestPercentage,
              latestPercentage: progress.latestPercentage,
              attemptsCount: progress.attemptsCount,
              mastered: progress.mastered,
              creditsEarned: progress.creditsEarned,
              totalCredits: progress.totalCredits,
            }
          : null,
        quizzes: quizEntry?.quizzes || [],
      };
    });

    return NextResponse.json({
      subject,
      topics: studentTopics,
    });
  } catch (error: any) {
    console.error('Get subject roadmap error:', error);
    return NextResponse.json({ error: 'Failed to get roadmap' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Roadmap] Generation request received');
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { subjectId } = body;
    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });
    }

    await connectDB();

    const subject = await Subject.findOne({ _id: subjectId, teacherId: decoded.userId }).lean();
    if (!subject) {
      console.error(`[Roadmap] Subject not found or unauthorized: ${subjectId} for user ${decoded.userId}`);
      return NextResponse.json({ error: 'Subject not found or unauthorized' }, { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('[Roadmap] GROQ_API_KEY is missing');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const classData = await Class.findById(subject.classId).lean();
    const classLabel = classData
      ? `${classData.name}, Grade ${classData.grade}${classData.section ? ` Section ${classData.section}` : ''}`
      : 'the current class';

    console.log(`[Roadmap] Generating for ${subject.name} - ${classLabel}`);

    const prompt = `Create a gamified learning roadmap for the school subject "${subject.name}" for ${classLabel}.

Return ONLY valid JSON in this shape:
{
  "learningTheme": "short world-building theme",
  "topics": [
    {
      "title": "topic name",
      "description": "1 sentence describing what students learn",
      "difficulty": "foundation|core|advanced",
      "estimatedCredits": 12,
      "villageName": "creative village/place name",
      "masteryThreshold": 70,
      "initialQuestions": [
        {
          "question": "question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "why A is correct"
        }
      ]
    }
  ]
}

Requirements:
- Generate 5 to 6 topics.
- For EACH topic, generate EXACTLY 3 multiple choice questions.
- Order topics from basics to advanced.
- Keep topic names curriculum-friendly for teachers.
- Make villageName playful but readable for school dashboards.
- estimatedCredits should be between 8 and 20.
- masteryThreshold should be between 60 and 85.
- No markdown. No commentary. JSON only.`;

    console.log('[Roadmap] Calling Groq API...');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: 'You are an expert curriculum designer. You always return roadmaps with initial quiz questions in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log(`[Roadmap] Received response from AI (length: ${content.length})`);
    
    let parsed;
    try {
      const startIndex = content.indexOf('{');
      const endIndex = content.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('AI response did not contain a JSON object');
      }
      const cleaned = content.substring(startIndex, endIndex + 1);
      parsed = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error('[Roadmap] Failed to parse AI response:', content);
      return NextResponse.json({ error: 'AI returned malformed data', details: parseError.message }, { status: 500 });
    }

    if (!Array.isArray(parsed.topics) || parsed.topics.length === 0) {
      console.error('[Roadmap] Invalid topics array in parsed response:', parsed);
      return NextResponse.json({ error: 'AI did not return any topics' }, { status: 500 });
    }

    const topicsWithQuestions = parsed.topics
      .filter((t: any) => t.title && t.description)
      .map((topic: any, index: number) => ({
        _id: new mongoose.Types.ObjectId(),
        title: topic.title,
        description: topic.description,
        order: index + 1,
        difficulty: ['foundation', 'core', 'advanced'].includes(topic.difficulty) ? topic.difficulty : 'core',
        estimatedCredits: Math.min(20, Math.max(8, Number(topic.estimatedCredits) || 10)),
        villageName: topic.villageName || `${topic.title} Village`,
        masteryThreshold: Math.min(85, Math.max(60, Number(topic.masteryThreshold) || 70)),
        initialQuestions: Array.isArray(topic.initialQuestions) ? topic.initialQuestions : [],
      }));

    if (topicsWithQuestions.length === 0) {
      console.error('[Roadmap] No valid topics after filtering:', parsed.topics);
      return NextResponse.json({ error: 'Generated topics were incomplete (missing title or description)' }, { status: 500 });
    }

    console.log(`[Roadmap] Saving ${topicsWithQuestions.length} topics to database...`);
    
    // Remove initialQuestions from the roadmap topics being saved to Subject model to keep it lean
    const roadmapTopics = topicsWithQuestions.map(({ initialQuestions, ...rest }: any) => rest);

    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        $set: {
          roadmap: {
            generatedAt: new Date(),
            classLabel,
            learningTheme: parsed.learningTheme || `${subject.name} Adventure`,
            topics: roadmapTopics,
          },
        },
      },
      { new: true }
    )
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email');

    // Automatically create Quizzes for each topic
    console.log('[Roadmap] Automatically creating quizzes for topics...');
    const quizPromises = topicsWithQuestions.map((topic: any) => {
      if (topic.initialQuestions.length === 0) return Promise.resolve();

      return Quiz.create({
        title: `${topic.title} Entrance Quiz`,
        description: `Prove your knowledge of ${topic.title} to master this village!`,
        subjectId,
        topicId: topic._id,
        topicTitle: topic.title,
        questions: topic.initialQuestions,
        duration: 10,
        totalMarks: topic.initialQuestions.length * 10,
        passingMarks: Math.ceil(topic.initialQuestions.length * 10 * 0.7), // 70% to pass
        isAIGenerated: true,
        createdBy: decoded.userId,
      });
    });

    await Promise.all(quizPromises);

    console.log('[Roadmap] Generation and automatic quiz creation successful!');
    return NextResponse.json({
      message: 'Roadmap and initial quizzes generated successfully',
      subject: updatedSubject,
    });
  } catch (error: any) {
    console.error('Generate subject roadmap error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap', details: error.message }, { status: 500 });
  }
}
