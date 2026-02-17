import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notice from '@/models/Notice';
import { verify } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    let userRole = 'student';

    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        userRole = decoded.role;
      } catch (err) {
        // Invalid token, treat as student
      }
    }

    const query: any = { isActive: true };

    // Filter by target audience
    if (userRole === 'student') {
      query.targetAudience = { $in: ['all', 'students'] };
    } else if (userRole === 'teacher') {
      query.targetAudience = { $in: ['all', 'teachers'] };
    }
    // Admin sees everything

    // Check if notice hasn't expired
    query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }];

    const notices = await Notice.find(query)
      .populate('postedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notices });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
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
    const userRole = decoded.role;

    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json({ error: 'Only admins and teachers can post notices' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, links, priority, targetAudience, attachments, expiresAt } = body;

    const notice = await Notice.create({
      title,
      description,
      links,
      postedBy: decoded.userId,
      postedByRole: userRole,
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      attachments,
      expiresAt,
    });

    const populatedNotice = await Notice.findById(notice._id).populate('postedBy', 'name email');

    return NextResponse.json({ notice: populatedNotice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const userRole = decoded.role;

    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json({ error: 'Only admins and teachers can delete notices' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const noticeId = searchParams.get('id');

    if (!noticeId) {
      return NextResponse.json({ error: 'Notice ID required' }, { status: 400 });
    }

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    // Only admin or the poster can delete
    if (userRole !== 'admin' && notice.postedBy.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized to delete this notice' }, { status: 403 });
    }

    await Notice.findByIdAndDelete(noticeId);

    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
