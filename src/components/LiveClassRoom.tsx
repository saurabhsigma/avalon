'use client';

import {
    LiveKitRoom,
    VideoConference,
    PreJoin,
    LocalUserChoices,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LiveClassRoomProps {
    roomName: string;
    userName: string;
    onLeave?: () => void;
}

export default function LiveClassRoom({ roomName, userName }: LiveClassRoomProps) {
    const [token, setToken] = useState('');
    const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/livekit/token`, {
                    method: 'POST',
                    body: JSON.stringify({ roomName: roomName, participantName: userName }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomName, userName]);

    const handleLeave = () => {
        router.push('/student/sessions');
    };

    if (token === '') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                <p className="text-lg">Getting things ready...</p>
            </div>
        );
    }

    if (!preJoinChoices) {
        return (
            <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
                <PreJoin
                    onError={(err) => console.error('PreJoin error:', err)}
                    defaults={{
                        username: userName,
                        videoEnabled: true,
                        audioEnabled: true,
                    }}
                    onSubmit={(values) => {
                        setPreJoinChoices(values);
                    }}
                />
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={preJoinChoices.videoEnabled}
            audio={preJoinChoices.audioEnabled}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={handleLeave}
            onError={(error) => {
                console.error('LiveKit Room error:', error);
            }}
            connect={true}
        >
            <VideoConference />
        </LiveKitRoom>
    );
}
