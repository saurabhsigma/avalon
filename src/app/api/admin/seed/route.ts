import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      passwordHash,
      role: 'admin',
      language: 'en',
      isActive: true,
      preferences: {
        theme: 'light',
        notifications: true,
        emailAlerts: true,
      },
      points: 0,
      badges: [],
    });

    return NextResponse.json({ 
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
