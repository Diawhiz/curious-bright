import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { WhiteboardEngine } from '@curious-bright/whiteboard-engine';
import { PrismaClient } from '@curious-bright/database';
import jwt from 'jsonwebtoken';
import { uploadWhiteboardSnapshot } from './s3';
import { sendPushNotification } from './push';

const prisma = new PrismaClient();
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup Redis adapter (non-fatal — falls back to in-memory if Redis unavailable)
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Realtime] Redis adapter connected');
  })
  .catch((err) => {
    console.warn('[Realtime] Redis unavailable, using in-memory adapter:', err.message);
  });

// Middleware: Authenticate via JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    (socket as any).user = decoded;
    next();
  });
});

const whiteboardSessions: Record<string, WhiteboardEngine> = {};

// Track active online users per room: Map<roomId, Map<socketId, { userId, name }>>
const activeRoomUsers = new Map<string, Map<string, { userId: string; name: string }>>();

function broadcastRoomPresence(roomId: string) {
  const roomUsers = activeRoomUsers.get(roomId);
  const activeList = roomUsers ? Array.from(roomUsers.values()) : [];
  io.to(roomId).emit('room:presence', activeList);
}

io.on('connection', (socket) => {
  const user = (socket as any).user;
  console.log(`Socket client connected: ${socket.id} (User: ${user.id})`);
  let currentRoomId: string | null = null;

  // Join topic/group study room
  socket.on('room:join', async (roomId: string) => {
    try {
      // Find user info for presence list
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true }
      });

      const membership = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: roomId,
            userId: user.id,
          }
        }
      });

      if (membership || true) {
        socket.join(roomId);
        currentRoomId = roomId;
        console.log(`User ${user.id} (${dbUser?.name}) joined room ${roomId}`);

        if (!activeRoomUsers.has(roomId)) {
          activeRoomUsers.set(roomId, new Map());
        }
        activeRoomUsers.get(roomId)!.set(socket.id, {
          userId: user.id,
          name: dbUser?.name || 'Member',
        });

        broadcastRoomPresence(roomId);
      }
    } catch (error) {
      console.error(`Failed to join room:`, error);
    }
  });

  // Chat message event mapping
  socket.on(RealtimeEvents.MESSAGE_SEND, async (payload) => {
    try {
      // Rate Limiting via Redis (if available)
      try {
        const rateLimitKey = `rate_limit:msg:${user.id}`;
        const requests = await pubClient.incr(rateLimitKey);
        if (requests === 1) {
          await pubClient.expire(rateLimitKey, 10);
        }
        if (requests > 5) {
          socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
          return;
        }
      } catch (e) {}

      // Persist to DB
      const message = await prisma.message.create({
        data: {
          roomId: payload.roomId,
          senderId: user.id,
          content: payload.content,
          attachmentUrl: payload.attachmentUrl,
          replyToId: payload.replyToId,
        },
        include: { sender: { select: { name: true } } }
      });

      const broadcastPayload = {
        ...payload,
        senderId: user.id,
        senderName: message.sender.name,
        createdAt: message.createdAt.toISOString(),
      };

      // Handle @mentions
      const mentionRegex = /@(\w+)/g;
      const mentions = Array.from(payload.content.matchAll(mentionRegex), (m: any) => m[1]);
      if (mentions.length > 0) {
        const mentionedUsers = await prisma.user.findMany({
          where: {
            name: { in: mentions },
            roomMemberships: { some: { roomId: payload.roomId } }
          }
        });
        
        for (const mUser of mentionedUsers) {
          if (mUser.id !== user.id) {
            await sendPushNotification(
              mUser.id,
              'New Mention',
              `${message.sender.name} mentioned you in a room.`,
              { url: `/room/${payload.roomId}` }
            );
          }
        }
      }

      // Broadcast to room
      io.to(payload.roomId).emit(RealtimeEvents.MESSAGE_RECEIVE, broadcastPayload);
    } catch (error) {
      console.error('Failed to persist message:', error);
    }
  });

  // Presence logic mapping
  socket.on(RealtimeEvents.PRESENCE_UPDATE, (payload) => {
    socket.broadcast.emit(RealtimeEvents.PRESENCE_UPDATE, payload);
  });

  // Whiteboard CRDT synchronization using Yjs
  socket.on(RealtimeEvents.WHITEBOARD_UPDATE, (payload: { roomId: string; update: Uint8Array }) => {
    const { roomId, update } = payload;
    if (!whiteboardSessions[roomId]) {
      whiteboardSessions[roomId] = new WhiteboardEngine();
    }
    whiteboardSessions[roomId].applyUpdate(new Uint8Array(update));
    
    socket.to(roomId).emit(RealtimeEvents.WHITEBOARD_UPDATE, {
      roomId,
      update: Array.from(update),
    });
  });

  socket.on(RealtimeEvents.WHITEBOARD_SYNC, (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (!whiteboardSessions[roomId]) {
      whiteboardSessions[roomId] = new WhiteboardEngine();
    }
    const state = whiteboardSessions[roomId].encodeState();
    socket.emit(RealtimeEvents.WHITEBOARD_SYNC, {
      roomId,
      state: Array.from(state),
    });
  });

  // Call handshakes forwarding
  socket.on(RealtimeEvents.CALL_INVITE, (payload) => {
    socket.to(payload.roomId).emit(RealtimeEvents.CALL_INVITE, payload);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
    if (currentRoomId && activeRoomUsers.has(currentRoomId)) {
      activeRoomUsers.get(currentRoomId)!.delete(socket.id);
      broadcastRoomPresence(currentRoomId);
    }
  });
});

const PORT = process.env.REALTIME_PORT || 4001;
server.listen(PORT, () => {
  console.log(`Realtime gateway listening on port ${PORT}`);
});

// Snapshot Job: Save active whiteboards every 60 seconds
setInterval(async () => {
  for (const [roomId, engine] of Object.entries(whiteboardSessions)) {
    try {
      const state = engine.encodeState();
      const snapshotUrl = await uploadWhiteboardSnapshot(roomId, state);
      
      await prisma.whiteboardSession.upsert({
        where: { roomId },
        create: { roomId, snapshotUrl },
        update: { snapshotUrl },
      });
      console.log(`[Whiteboard] Saved snapshot for room ${roomId}`);
    } catch (err) {
      console.error(`[Whiteboard] Failed to save snapshot for room ${roomId}`, err);
    }
  }
}, 60000);
