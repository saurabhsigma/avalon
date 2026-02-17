import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import Class from '@/models/Class';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        if (decoded.role !== 'student') {
            return NextResponse.json({ error: 'Only students can join classes' }, { status: 403 });
        }

        await connectDB();

        const { classId } = await req.json();
        if (!classId) {
            return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
        }

        // Verify class exists
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // Update User
        await User.findByIdAndUpdate(decoded.userId, { classId: classId });

        // Update Class (add to students list if not already there)
        await Class.findByIdAndUpdate(classId, {
            $addToSet: { students: decoded.userId }
        });

        return NextResponse.json(
            { message: 'Successfully joined class' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Join class error:', error);
        return NextResponse.json({ error: 'Failed to join class' }, { status: 500 });
    }
}
