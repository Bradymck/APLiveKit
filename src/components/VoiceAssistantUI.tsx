import React, { useState, useEffect, useCallback } from 'react';
import { RoomAudioRenderer } from '@livekit/components-react';

const VoiceAssistantUI = ({ isAudioEnabled, audioContextInitialized }: { isAudioEnabled: boolean, audioContextInitialized: boolean }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connectWebSocket = useCallback(() => {
    if (isAudioEnabled && audioContextInitialized && connectionAttempts < 5) {
      const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws';
      console.log(`Attempting to connect to WebSocket (Attempt ${connectionAttempts + 1}):`, websocketUrl);
      setConnectionStatus('Connecting...');
      
      const websocket = new WebSocket(websocketUrl);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
        setWs(websocket);
        setConnectionAttempts(0);
      };

      websocket.onmessage = (event) => {
        const message = event.data;
        console.log('Raw message from server:', message);
        try {
          let parsedMessage;
          if (typeof message === 'string' && message.startsWith('Assistant:')) {
            parsedMessage = JSON.parse(message.substring(11).trim());
          } else {
            parsedMessage = JSON.parse(message);
          }
          console.log('Parsed message:', parsedMessage);
          setMessages((prevMessages) => [...prevMessages, parsedMessage.text]);
          if (parsedMessage.audio) {
            console.log('Audio data received, length:', parsedMessage.audio.length);
            const audioData = atob(parsedMessage.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            console.log('Audio URL created:', url);
          } else {
            console.log('No audio data in the message');
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          console.error('Raw message causing error:', message);
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error: Connection failed');
      };

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('Disconnected');
        setWs(null);
        setConnectionAttempts((prevAttempts) => prevAttempts + 1);
        if (connectionAttempts < 4) {
          console.log(`Attempting to reconnect in 5 seconds (Attempt ${connectionAttempts + 2})`);
          setTimeout(connectWebSocket, 5000);
        } else {
          console.log('Max reconnection attempts reached. Please try again later.');
          setConnectionStatus('Connection failed. Please try again later.');
        }
      };
    }
  }, [isAudioEnabled, audioContextInitialized, connectionAttempts]);

  useEffect(() => {
    if (isAudioEnabled && audioContextInitialized) {
      connectWebSocket();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAudioEnabled, audioContextInitialized, connectWebSocket]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }, [audioUrl]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ text: input });
      console.log('Sending message:', message);
      ws.send(message);
      setInput('');
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <div>
      <h1>Voice Assistant</h1>
      <p>Connection status: {connectionStatus}</p>
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>{typeof msg === 'string' ? msg : JSON.stringify(msg)}</div>
        ))}
      </div>
      <RoomAudioRenderer />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={!isAudioEnabled || ws?.readyState !== WebSocket.OPEN}
      />
      <button 
        onClick={sendMessage} 
        disabled={!isAudioEnabled || ws?.readyState !== WebSocket.OPEN}
      >
        Send
      </button>
    </div>
  );
};

export default VoiceAssistantUI;