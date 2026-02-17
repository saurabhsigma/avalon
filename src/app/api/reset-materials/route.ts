import { NextRequest, NextResponse } from 'next/server';
import Material from '@/models/Material';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Delete all materials and recreate collection
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Drop the entire materials collection to fix schema issues
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropCollection('materials').catch(() => {});
    }

    return NextResponse.json({ 
      message: 'Materials collection reset. Please re-upload materials.'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reset materials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
