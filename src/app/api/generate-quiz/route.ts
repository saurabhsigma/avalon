import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { verify } from 'jsonwebtoken';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can generate quizzes' }, { status: 403 });
    }

    const { topic, subject, numQuestions, difficulty } = await req.json();

    if (!topic || !numQuestions) {
      return NextResponse.json({ error: 'Topic and number of questions required' }, { status: 400 });
    }

    const prompt = `Generate ${numQuestions} multiple choice questions about ${topic}${subject ? ` in ${subject}` : ''}${difficulty ? ` at ${difficulty} difficulty level` : ''}.

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The index of the correct answer (0-3)
4. A brief explanation of why that answer is correct

Format the response EXACTLY as a valid JSON array like this:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2,
    "explanation": "Paris is the capital and largest city of France."
  }
]

Return ONLY the JSON array, no additional text or markdown formatting.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a quiz generator that creates educational multiple-choice questions. Always respond with valid JSON only, no markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON
    const questions = JSON.parse(cleanedResponse);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate quiz', 
      details: error.message 
    }, { status: 500 });
  }
}
