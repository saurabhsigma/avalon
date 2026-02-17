import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Groq from 'groq-sdk';
import { getContextForAI } from '@/lib/pinecone';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's class context if student
    await connectDB();
    let classId: string | undefined;
    if (decoded.role === 'student') {
      const User = (await import('@/models/User')).default;
      const user = await User.findById(decoded.userId);
      classId = user?.classId?.toString();
    }

    // Get relevant study materials from Pinecone for context
    const materialContext = await getContextForAI(message, classId);

    // Build system prompt with context
    let systemPrompt = 'You are a helpful AI teaching assistant for students. Provide clear, educational responses.';
    
    if (materialContext) {
      systemPrompt += '\n\nYou have access to the following study materials that may be relevant to the student\'s question:\n\n' + materialContext;
      systemPrompt += '\n\nUse these materials to provide accurate, contextual answers. If the materials contain relevant information, reference them in your response. If not, provide general educational guidance.';
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      response: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (error.message?.includes('verify')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (error.message?.includes('GROQ')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
