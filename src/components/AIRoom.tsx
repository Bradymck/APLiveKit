import { useRoomContext, useParticipants, useTracks, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Track } from 'livekit-client';

const AIRoom = () => {
  const room = useRoomContext();
  const participants = useParticipants();
  const tracks = useTracks();
  const localParticipant = useLocalParticipant();
  const [audioInputEnabled, setAudioInputEnabled] = useState(false);

  useEffect(() => {
    const enableAudioInput = async () => {
      try {
        await localParticipant.enableAudio();
        setAudioInputEnabled(true);
      } catch (error) {
        console.error('Error enabling audio:', error);
      }
    };
    enableAudioInput();
  }, [localParticipant]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>LiveKit Room: {room.name || 'Connecting...'}</h1>
      <h2 style={{ color: '#666' }}>Participants:</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {participants.map((participant) => (
          <li key={participant.identity} style={{ marginBottom: '10px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
            <strong>{participant.identity}</strong> (State: {participant.connectionQuality})
          </li>
        ))}
      </ul>
      <h2 style={{ color: '#666' }}>Tracks:</h2>
      {tracks.length === 0 ? (
        <p>No tracks available yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tracks.map((trackReference, index) => (
            <li key={index} style={{ marginBottom: '10px', backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '5px' }}>
              {trackReference.publication.kind} track from {trackReference.participant.identity}
              (State: {trackReference.publication.track?.state})
            </li>
          ))}
        </ul>
      )}
      <RoomAudioRenderer />
    </div>
  );
};

export default AIRoom;