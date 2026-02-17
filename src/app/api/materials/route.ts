import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongodb';
import { storeMaterial, deleteMaterial as deletePineconeMaterial } from '@/lib/pinecone';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get all materials
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const sessionId = searchParams.get('sessionId');
    const classId = searchParams.get('classId');
    const type = searchParams.get('type');

    let query: any = {};
    
    // Students can only see materials for their class
    if (decoded.role === 'student') {
      // Get user's classId
      const User = (await import('@/models/User')).default;
      const user = await User.findById(decoded.userId);
      if (user && user.classId) {
        query.classId = user.classId;
      }
    } else if (classId) {
      query.classId = classId;
    }
    
    if (subjectId) {
      query.subjectId = subjectId;
    }
    if (sessionId) {
      query.sessionId = sessionId;
    }
    if (type) {
      query.type = type;
    }

    const materials = await Material.find(query)
      .populate('subjectId', 'name color')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ materials }, { status: 200 });
  } catch (error: any) {
    console.error('Get materials error:', error);
    return NextResponse.json({ error: 'Failed to get materials' }, { status: 500 });
  }
}

// Create new material
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { title, type, url, thumbnail, description, classId, subjectId, sessionId, fileSize, duration, tags } = await req.json();

    if (!title || !type || !url || !classId || !subjectId) {
      return NextResponse.json(
        { error: 'Title, type, url, classId, and subjectId are required' },
        { status: 400 }
      );
    }

    // Verify class exists
    const Class = (await import('@/models/Class')).default;
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    const material = await Material.create({
      title,
      type,
      url,
      thumbnail,
      description,
      classId,
      subjectId,
      sessionId,
      uploadedBy: decoded.userId,
      fileSize,
      duration,
      tags: tags || [],
    });

    // Store in Pinecone for semantic search (asynchronously, don't block)
    storeMaterial(
      material._id.toString(),
      title,
      description || '',
      tags?.join(' ') || '',
      {
        classId: classId.toString(),
        subjectId: subjectId.toString(),
        type,
        url,
      }
    ).catch(err => console.error('Pinecone storage error:', err));

    return NextResponse.json(
      { message: 'Material created successfully', material },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create material error:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}

// Delete material
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const material = await Material.findOne({
      _id: materialId,
      uploadedBy: decoded.userId,
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found or unauthorized' },
        { status: 404 }
      );
    }

    await Material.findByIdAndDelete(materialId);

    // Delete from Pinecone (asynchronously)
    deletePineconeMaterial(materialId).catch(err => 
      console.error('Pinecone deletion error:', err)
    );

    return NextResponse.json(
      { message: 'Material deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete material error:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
