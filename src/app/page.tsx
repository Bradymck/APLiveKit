'use client';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LiveKitRoom, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import AIRoom from '../components/AIRoom';

export default function Home() {
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('/api/get-participant-token');
      const data = await response.json();
      setToken(data.token);
      setRoomName(data.roomName);
    };

    fetchToken();
  }, []);

  if (!token || !roomName) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectButton />
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: '100vh' }}
      >
        <AIRoom />
        <RoomAudioRenderer />
        <ControlBar />
      </LiveKitRoom>
    </main>
  );
}