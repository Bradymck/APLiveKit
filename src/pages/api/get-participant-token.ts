import { AccessToken } from 'livekit-server-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const roomName = 'ai-voice-assistant-room';

  if (!apiKey || !apiSecret) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: `user-${Date.now()}`,
  });

  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  res.status(200).json({
    token: at.toJwt(),
    roomName,
  });
}