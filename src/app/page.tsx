'use client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import { useState, useEffect } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <main>
      {token === null ? (
        <button onClick={async () => {
          try {
            const {accessToken, url} = await fetch('/api/token').then(res => res.json());
            setToken(accessToken);
            setUrl(url);
          } catch (error) {
            console.error('Error fetching token:', error);
            // Handle the error appropriately (e.g., show an error message to the user)
          }
        }}>Connect</button>
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connectOptions={{autoSubscribe: true}}
          audio={true}
        >
          <ActiveRoom />
        </LiveKitRoom>
      )}
    </main>
  );
}

const ActiveRoom = () => {
  const { localParticipant } = useLocalParticipant();
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (localParticipant && !isConnected) {
      setIsConnected(true);
      enableMicrophone();
    }
  }, [localParticipant]);

  const enableMicrophone = async () => {
    try {
      await localParticipant?.setMicrophoneEnabled(true);
      setIsMicrophoneEnabled(true);
    } catch (error) {
      console.error('Error enabling microphone:', error);
    }
  };

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const newState = !isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(newState);
      setIsMicrophoneEnabled(newState);
    }
  };

  return (
    <>
      <RoomAudioRenderer />
      <button onClick={toggleMicrophone} disabled={!isConnected}>
        {isMicrophoneEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
      </button>
      <div>Audio Enabled: {isMicrophoneEnabled ? 'Unmuted' : 'Muted'}</div>
      <div>Connection Status: {isConnected ? 'Connected' : 'Connecting...'}</div>
    </>
  );
};