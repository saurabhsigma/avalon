import { NextRequest, NextResponse } from 'next/server';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongodb';

// Fix materials without classId
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Find materials without classId
    const materialsWithoutClass = await Material.find({
      $or: [
        { classId: null },
        { classId: { $exists: false } }
      ]
    }).populate('subjectId');

    let fixed = 0;
    for (const material of materialsWithoutClass) {
      if (material.subjectId && (material.subjectId as any).classId) {
        material.classId = (material.subjectId as any).classId;
        await material.save();
        fixed++;
      }
    }

    return NextResponse.json({ 
      message: `Fixed ${fixed} materials`,
      count: fixed
    }, { status: 200 });
  } catch (error: any) {
    console.error('Fix materials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
