import { NextRequest, NextResponse } from 'next/server';
import Material from '@/models/Material';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Debug endpoint to check materials and user data
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const materials = await Material.find()
      .lean();

    const students = await User.find({ role: 'student' })
      .lean();

    return NextResponse.json({ 
      materialsCount: materials.length,
      materials: materials.map((m: any) => ({
        title: m.title,
        classId: m.classId?.toString() || 'MISSING',
        subjectId: m.subjectId?.toString() || 'MISSING',
        allFields: Object.keys(m)
      })),
      studentsCount: students.length,
      students: students.map(s => ({
        name: s.name,
        email: s.email,
        classId: s.classId?.toString()
      }))
    }, { status: 200 });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
