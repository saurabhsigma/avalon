import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClassMessage from '@/models/ClassMessage';
import Class from '@/models/Class';
import { verify } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Verify user has access to this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const isTeacher = decoded.role === 'teacher' && classData.teacherId.toString() === decoded.userId;
    const isStudent = decoded.role === 'student' && classData.students.some((s: any) => s.toString() === decoded.userId);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages
    const messages = await ClassMessage.find({ classId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
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
    const body = await req.json();
    const { classId, content, messageType, fileUrl, fileName } = body;

    if (!classId || !content) {
      return NextResponse.json({ error: 'Class ID and content required' }, { status: 400 });
    }

    // Get user info
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId).select('name');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const isTeacher = decoded.role === 'teacher' && classData.teacherId.toString() === decoded.userId;
    const isStudent = decoded.role === 'student' && classData.students.some((s: any) => s.toString() === decoded.userId);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only teachers can send announcements
    if (messageType === 'announcement' && decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can send announcements' }, { status: 403 });
    }

    // Create message
    const message = await ClassMessage.create({
      classId,
      senderId: decoded.userId,
      senderName: user.name,
      senderRole: decoded.role,
      messageType: messageType || 'text',
      content,
      fileUrl,
      fileName,
      readBy: [decoded.userId],
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const message = await ClassMessage.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (action === 'markRead') {
      if (!message.readBy.includes(decoded.userId)) {
        message.readBy.push(decoded.userId);
        await message.save();
      }
      return NextResponse.json({ message: 'Marked as read' });
    }

    if (action === 'pin') {
      // Only teachers can pin messages
      if (decoded.role !== 'teacher') {
        return NextResponse.json({ error: 'Only teachers can pin messages' }, { status: 403 });
      }
      message.isPinned = !message.isPinned;
      await message.save();
      return NextResponse.json({ message });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
