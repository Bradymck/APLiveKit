import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const roomName = req.body.roomName;

  if (!apiKey || !apiSecret) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: 'egress-user',
  });

  // Correctly use VideoGrant as a type
  const videoGrant: VideoGrant = { roomRecord: true };
  at.addGrant(videoGrant);

  const token = at.toJwt();

  const response = await fetch(`https://${process.env.LIVEKIT_URL}/twirp/livekit.Egress/StartRoomCompositeEgress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      room_name: roomName,
      file_outputs: [{
        filepath: `${roomName}-${Date.now()}.mp4`,
      }],
    }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}