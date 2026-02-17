import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import LiveClassRoom from '@/components/LiveClassRoom';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    let userName = 'User';

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // Try to get name from token if available, otherwise fallback to email or default
        if (decoded.name) {
            userName = decoded.name;
        } else if (decoded.email) {
            userName = decoded.email.split('@')[0];
        }
    } catch (err) {
        redirect('/login');
    }

    const { sessionId } = await params;

    return <LiveClassRoom roomName={sessionId} userName={userName} />;
}
