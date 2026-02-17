import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful and knowledgeable AI teaching assistant for a student platform. Answer questions concisely and accurately. If you do not know the answer, admit it. Be encouraging and supportive.'
                },
                ...messages
            ],
            model: 'llama-3.1-8b-instant',
        });

        const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ reply }, { status: 200 });
    } catch (error: any) {
        console.error('AI Chat error:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
