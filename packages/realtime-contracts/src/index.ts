export const RealtimeEvents = {
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  PRESENCE_UPDATE: 'presence:update',
  WHITEBOARD_UPDATE: 'whiteboard:update',
  WHITEBOARD_SYNC: 'whiteboard:sync',
  CALL_INVITE: 'call:invite',
  CALL_ACCEPT: 'call:accept',
  CALL_DECLINE: 'call:decline',
  CALL_END: 'call:end',
} as const;

export type RealtimeEvent = typeof RealtimeEvents[keyof typeof RealtimeEvents];

export interface MessagePayload {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string | null;
  replyToId?: string | null;
  createdAt: string;
}

export interface PresencePayload {
  userId: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  roomId?: string | null;
}

export interface WhiteboardUpdatePayload {
  roomId: string;
  sessionId: string;
  update: Uint8Array; // CRDT update array (Yjs state update)
}

export interface CallInvitePayload {
  callSessionId: string;
  roomId: string;
  hostId: string;
  hostName: string;
  type: 'video' | 'audio';
}

export interface CallResponsePayload {
  callSessionId: string;
  userId: string;
  accepted: boolean;
}
