import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, role } = await req.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // For students, auto-assign to first available class
    let classId = undefined;
    if (role === 'student') {
      const Class = (await import('@/models/Class')).default;
      const firstClass = await Class.findOne().sort({ createdAt: 1 });
      if (firstClass) {
        classId = firstClass._id;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      classId,
      language: 'en',
      preferences: {
        theme: 'system',
        notifications: true,
        emailAlerts: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          classId: user.classId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
