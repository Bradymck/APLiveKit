import { useRoomContext, useParticipants, useTracks } from '@livekit/components-react';
import { useState, useCallback, useEffect } from 'react';
import { Track, Room } from 'livekit-client';
import VoiceAssistantUI from './VoiceAssistantUI';
import { createLocalAudioTrack } from 'livekit-client';

const AIRoom = () => {
  const room = useRoomContext();
  const participants = useParticipants();
  const tracks = useTracks();
  const [audioInputEnabled, setAudioInputEnabled] = useState(false);

  const enableAudioInput = useCallback(async () => {
    if (room.localParticipant && !audioInputEnabled) {
      try {
        const audioTrack = await createLocalAudioTrack();
        await room.localParticipant.publishTrack(audioTrack);
        setAudioInputEnabled(true);
      } catch (error) {
        console.error('Error enabling audio:', error);
      }
    }
  }, [room, audioInputEnabled]);

  useEffect(() => {
    if (room) {
      const handleTrackPublished = () => {
        setAudioInputEnabled(true);
      };
      room.on('trackPublished', handleTrackPublished);
      return () => {
        room.off('trackPublished', handleTrackPublished);
      };
    }
  }, [room]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>LiveKit Room: {room.name || 'Connecting...'}</h1>
      <h2 style={{ color: '#666' }}>Participants: {participants.length}</h2>
      {!audioInputEnabled ? (
        <button onClick={enableAudioInput} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Enable Microphone
        </button>
      ) : (
        <p>Microphone enabled</p>
      )}
      <VoiceAssistantUI />
    </div>
  );
};

export default AIRoom;