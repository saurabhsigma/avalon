import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AccessToken } from 'livekit-server-sdk';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    const { roomName, participantName } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Room name and participant name are required' },
        { status: 400 }
      );
    }

    // Create LiveKit access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: decoded.userId,
      name: participantName,
    });

    // Grant permissions based on role
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // Teachers get additional permissions
      ...(decoded.role === 'teacher' && {
        roomAdmin: true,
        canUpdateOwnMetadata: true,
      }),
    });

    const livekitToken = await at.toJwt();

    return NextResponse.json(
      {
        token: livekitToken,
        url: process.env.LIVEKIT_URL,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('LiveKit token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
