import React, { useEffect, useState, useMemo, useRef } from 'react';
import { WhiteboardEngine, DrawStroke } from '@curious-bright/whiteboard-engine';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { Socket } from 'socket.io-client';


interface WhiteboardProps {
  roomId: string;
  socket: Socket | null;
}

export function Whiteboard({ roomId, socket }: WhiteboardProps) {
  const engine = useMemo(() => new WhiteboardEngine(), []);
  const [synced, setSynced] = useState(false);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const currentStrokeRef = useRef<DrawStroke | null>(null);

  // Re-render when engine updates
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

  const getCoordinates = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getCoordinates(e);
    const newStroke: DrawStroke = {
      id: crypto.randomUUID(),
      color: '#000000',
      width: 3,
      points: [pos],
    };
    currentStrokeRef.current = newStroke;
    engine.addStroke(newStroke);
    updateLocalStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!currentStrokeRef.current) return;
    const pos = getCoordinates(e);
    
    // Create a new stroke object to trigger Yjs update properly
    const updatedStroke = {
      ...currentStrokeRef.current,
      points: [...currentStrokeRef.current.points, pos]
    };
    
    currentStrokeRef.current = updatedStroke;
    engine.addStroke(updatedStroke);
    updateLocalStrokes();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    currentStrokeRef.current = null;
  };

  if (!synced) {
    return <div className="flex h-full items-center justify-center p-8 border rounded-lg bg-gray-50 text-gray-500">Loading whiteboard...</div>;
  }

  return (
    <div className="w-full h-full relative border rounded-lg overflow-hidden bg-white shadow-inner flex flex-col">
      <div className="p-2 border-b bg-gray-50 flex gap-2">
        <button 
          onClick={() => { engine.clear(); updateLocalStrokes(); }}
          className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
        >
          Clear Board
        </button>
      </div>
      <svg
        ref={svgRef}
        className="flex-1 w-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {strokes.map((stroke) => (
          <polyline
            key={stroke.id}
            points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
