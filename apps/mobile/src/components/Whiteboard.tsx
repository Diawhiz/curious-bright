import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { WhiteboardEngine, DrawStroke } from '@curious-bright/whiteboard-engine';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

interface WhiteboardProps {
  roomId: string;
  socket: Socket | null;
}

export function Whiteboard({ roomId, socket }: WhiteboardProps) {
  const engine = useMemo(() => new WhiteboardEngine(), []);
  const [synced, setSynced] = useState(false);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const currentStrokeRef = useRef<DrawStroke | null>(null);

  const updateLocalStrokes = () => {
    setStrokes(engine.getStrokes());
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit(RealtimeEvents.WHITEBOARD_SYNC, { roomId });

    const handleSync = (payload: { roomId: string; state: number[] }) => {
      if (payload.roomId === roomId) {
        engine.applyUpdate(new Uint8Array(payload.state));
        setSynced(true);
        updateLocalStrokes();
      }
    };

    const handleUpdate = (payload: { roomId: string; update: number[] }) => {
      if (payload.roomId === roomId) {
        engine.applyUpdate(new Uint8Array(payload.update));
        updateLocalStrokes();
      }
    };

    socket.on(RealtimeEvents.WHITEBOARD_SYNC, handleSync);
    socket.on(RealtimeEvents.WHITEBOARD_UPDATE, handleUpdate);

    engine.onUpdate((update) => {
      socket.emit(RealtimeEvents.WHITEBOARD_UPDATE, {
        roomId,
        update: Array.from(update),
      });
      updateLocalStrokes();
    });

    return () => {
      socket.off(RealtimeEvents.WHITEBOARD_SYNC, handleSync);
      socket.off(RealtimeEvents.WHITEBOARD_UPDATE, handleUpdate);
    };
  }, [socket, roomId, engine]);

  const handleResponderGrant = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const newStroke: DrawStroke = {
      id: uuidv4(),
      color: '#000000',
      width: 3,
      points: [{ x: locationX, y: locationY }],
    };
    currentStrokeRef.current = newStroke;
    engine.addStroke(newStroke);
    updateLocalStrokes();
  };

  const handleResponderMove = (e: any) => {
    if (!currentStrokeRef.current) return;
    const { locationX, locationY } = e.nativeEvent;
    
    const updatedStroke = {
      ...currentStrokeRef.current,
      points: [...currentStrokeRef.current.points, { x: locationX, y: locationY }]
    };
    
    currentStrokeRef.current = updatedStroke;
    engine.addStroke(updatedStroke);
    updateLocalStrokes();
  };

  const handleResponderRelease = () => {
    currentStrokeRef.current = null;
  };

  if (!synced) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading whiteboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.clearBtn} 
          onPress={() => { engine.clear(); updateLocalStrokes(); }}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View 
        style={styles.canvasContainer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleResponderGrant}
        onResponderMove={handleResponderMove}
        onResponderRelease={handleResponderRelease}
      >
        <Svg style={styles.svg}>
          {strokes.map((stroke) => (
            <Polyline
              key={stroke.id}
              points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#888' },
  toolbar: { padding: 8, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'flex-start' },
  clearBtn: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 4 },
  clearText: { color: '#ef4444', fontWeight: 'bold' },
  canvasContainer: { flex: 1, overflow: 'hidden' },
  svg: { flex: 1, width: '100%', height: '100%' },
});
