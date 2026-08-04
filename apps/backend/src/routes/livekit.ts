import { Router } from 'express';
import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

const webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

// Issue short-lived join tokens
router.post('/token', requireAuth, async (req: any, res: any) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });

  const userId = req.user.id;

  // Retrieve user name
  const user = await prisma.user.findUnique({ where: { id: userId }});
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Generate LiveKit token
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    name: user.name,
    ttl: '10m',
  });
  
  at.addGrant({ roomJoin: true, room: roomId });

  res.json({ token: await at.toJwt() });
});

// Handle LiveKit Webhooks to log sessions/participants
router.post('/webhook', async (req, res) => {
  try {
    const event = await webhookReceiver.receive(req.body, req.get('Authorization'));
    
    if (event.event === 'room_started') {
      const existingSession = await prisma.callSession.findFirst({
        where: { roomId: event.room!.name, status: 'ONGOING' },
      });
      if (existingSession) {
        await prisma.callSession.update({
          where: { id: existingSession.id },
          data: {
            status: 'ONGOING',
            startedAt: new Date(),
            endedAt: null,
          },
        });
      } else {
        await prisma.callSession.create({
          data: {
            roomId: event.room!.name,
            status: 'ONGOING',
          },
        });
      }
    } else if (event.event === 'room_finished') {

      await prisma.callSession.updateMany({
        where: { roomId: event.room!.name, status: 'ONGOING' },
        data: { status: 'ENDED', endedAt: new Date() }
      });
    } else if (event.event === 'participant_joined') {
      const callSession = await prisma.callSession.findFirst({
        where: { roomId: event.room!.name, status: 'ONGOING' },
      });
      if (callSession) {
        await prisma.callParticipant.upsert({
          where: { callId_userId: { callId: callSession.id, userId: event.participant!.identity } },
          create: {
            callId: callSession.id,
            userId: event.participant!.identity,
          },
          update: {
            leftAt: null,
          }
        });
      }
    } else if (event.event === 'participant_left') {
      const callSession = await prisma.callSession.findFirst({
        where: { roomId: event.room!.name, status: 'ONGOING' },
      });
      if (callSession) {
        await prisma.callParticipant.updateMany({
          where: { callId: callSession.id, userId: event.participant!.identity, leftAt: null },
          data: { leftAt: new Date() }
        });
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error('Error handling webhook', error);
    res.status(400).send();
  }
});

export default router;
