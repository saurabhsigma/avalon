import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  if (decoded.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }

  return { decoded };
}

export async function GET(req: NextRequest) {
  try {
    const access = await requireAdmin(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();

    const users = await User.find()
      .select('name email role classId isActive isVerified lastLogin createdAt')
      .populate('classId', 'name grade section')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAdmin(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();

    const { name, email, password, role = 'teacher' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!['teacher', 'student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isVerified: role !== 'teacher',
      isActive: true,
      language: 'en',
      preferences: {
        theme: 'system',
        notifications: true,
        emailAlerts: true,
      },
      points: 0,
      badges: [],
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin user create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const access = await requireAdmin(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();

    const { userId, isActive, isVerified, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    if (typeof isVerified === 'boolean') {
      user.isVerified = isVerified;
    }

    if (role && ['teacher', 'student', 'admin'].includes(role)) {
      user.role = role;
      if (role !== 'teacher') {
        user.isVerified = true;
      }
    }

    await user.save();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}