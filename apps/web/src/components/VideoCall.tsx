import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

interface VideoCallProps {
  roomId: string;
  token: string;
  onLeave: () => void;
}

export function VideoCall({ roomId: _roomId, token, onLeave }: VideoCallProps) {
  const [serverUrl] = useState(
    import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'
  );

  return (
    <div style={{ height: '100%', width: '100%', background: 'var(--color-paper-card)', position: 'relative' }}>
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%', width: '100%' }}
        onDisconnected={onLeave}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
