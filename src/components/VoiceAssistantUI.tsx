import React, { useState, useEffect, useCallback } from 'react';

const VoiceAssistantUI = ({ isAudioEnabled }: { isAudioEnabled: boolean }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const connectWebSocket = useCallback(() => {
    if (isAudioEnabled) {
      const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws';
      console.log('Attempting to connect to WebSocket:', websocketUrl);
      const websocket = new WebSocket(websocketUrl);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        const message = event.data;
        console.log('Received message from server:', message);
        try {
          const parsedMessage = JSON.parse(message);
          setMessages((prevMessages) => [...prevMessages, parsedMessage.text || parsedMessage]);
          if (parsedMessage.audio) {
            const blob = new Blob([parsedMessage.audio], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error: ' + error.toString());
      };

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('Disconnected');
        setWs(null);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    }
  }, [isAudioEnabled]);

  useEffect(() => {
    if (isAudioEnabled) {
      connectWebSocket();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAudioEnabled, connectWebSocket]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(input);
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
      {audioUrl && <audio src={audioUrl} autoPlay />}
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