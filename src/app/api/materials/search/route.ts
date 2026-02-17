import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { searchMaterials } from '@/lib/pinecone';
import Material from '@/models/Material';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Semantic search endpoint for materials using Pinecone
 * This provides intelligent search across all study materials
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    await connectDB();

    const { query, classId, subjectId, type, limit = 10 } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build filters for Pinecone
    const filters: any = {};
    
    // Students can only search their own class materials
    if (decoded.role === 'student') {
      const User = (await import('@/models/User')).default;
      const user = await User.findById(decoded.userId);
      if (user && user.classId) {
        filters.classId = user.classId.toString();
      }
    } else if (classId) {
      filters.classId = classId;
    }
    
    if (subjectId) {
      filters.subjectId = subjectId;
    }
    if (type) {
      filters.type = type;
    }

    // Perform semantic search in Pinecone
    const searchResults = await searchMaterials(query, filters, Math.min(limit, 20));

    // Get full material details from MongoDB
    const materialIds = searchResults.map(result => result.id);
    const materials = await Material.find({ _id: { $in: materialIds } })
      .populate('subjectId', 'name color')
      .populate('uploadedBy', 'name email')
      .lean();

    // Merge search scores with material details
    const resultsWithScores = materials.map(material => {
      const searchResult = searchResults.find(r => r.id === material._id.toString());
      return {
        ...material,
        relevanceScore: searchResult?.score || 0,
      };
    });

    // Sort by relevance score
    resultsWithScores.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return NextResponse.json({
      query,
      results: resultsWithScores,
      count: resultsWithScores.length,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}
