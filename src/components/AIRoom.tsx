import { useRoomContext, useParticipants } from '@livekit/components-react';
import { useState, useEffect } from 'react';
import VoiceAssistantUI from './VoiceAssistantUI';
import { RemoteTrackPublication, RemoteParticipant, RoomEvent, Track, LocalParticipant } from 'livekit-client';

const AIRoom = () => {
  const room = useRoomContext();
  const participants = useParticipants();
  const [audioInputEnabled, setAudioInputEnabled] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);

  const initializeAudioContext = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().then(() => {
      setAudioContextInitialized(true);
    });
  };

  useEffect(() => {
    if (room && audioContextInitialized) {
      const handleTrackPublished = (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log('Remote track published:', publication.trackSid, participant.identity);
        if (publication.kind === Track.Kind.Audio) {
          setAudioInputEnabled(true);
        }
      };

      const handleLocalTrackPublished = (track: LocalTrackPublication, participant: LocalParticipant) => {
        console.log('Local track published:', track.trackSid, participant.identity);
        if (track.kind === Track.Kind.Audio) {
          setAudioInputEnabled(true);
        }
      };

      room.on(RoomEvent.TrackPublished, handleTrackPublished);
      room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);

      return () => {
        room.off(RoomEvent.TrackPublished, handleTrackPublished);
        room.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
      };
    }
  }, [room, audioContextInitialized]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>LiveKit Room: {room.name || 'Connecting...'}</h1>
      <h2 style={{ color: '#666' }}>Participants: {participants.length}</h2>
      {!audioContextInitialized && (
        <button onClick={initializeAudioContext}>Initialize Audio</button>
      )}
      {audioInputEnabled ? (
        <p>Voice Assistant Active</p>
      ) : (
        <p>Waiting for Voice Assistant...</p>
      )}
      {audioContextInitialized && <VoiceAssistantUI isAudioEnabled={audioInputEnabled} audioContextInitialized={audioContextInitialized} />}
    </div>
  );
};

export default AIRoom;