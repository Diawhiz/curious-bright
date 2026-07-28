import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  LiveKitRoom,
  RoomEvent,
} from '@livekit/react-native';

// NOTE: livekit react native components for UI need custom implementation 
// or one can use pre-built components if imported properly. 
// @livekit/react-native provides a headless API and basic views.
import { AudioSession } from '@livekit/react-native';

interface VideoCallProps {
  roomId: string;
  token: string;
  onLeave: () => void;
}

export function VideoCall({ roomId, token, onLeave }: VideoCallProps) {
  const [serverUrl] = useState(
    process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880'
  );

  // Ideally, you'd iterate through tracks and use <VideoView> component 
  // provided by @livekit/react-native, but for Phase 7 scaffold, 
  // LiveKitRoom provides the connection wrapper.
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={onLeave}
      style={styles.container}
    >
      {/* 
        In a full implementation, you would map over useTracks() and render 
        <VideoView track={track} /> for each participant.
        This provides the scaffolding connection.
      */}
      <View style={styles.placeholder} />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
  }
});
