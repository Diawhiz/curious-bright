import React, { useEffect, useState, useMemo, useRef } from 'react';
import { WhiteboardEngine, DrawStroke } from '@curious-bright/whiteboard-engine';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { Socket } from 'socket.io-client';
import { CursorTag } from './CursorTag';
import { CuriousLoading } from './CuriousStates';

interface WhiteboardProps {
  roomId: string;
  socket: Socket | null;
}

interface InkPoint {
  x: number;
  y: number;
  id: string;
  color: string;
  timestamp: number;
}

export function Whiteboard({ roomId, socket }: WhiteboardProps) {
  const engine = useMemo(() => new WhiteboardEngine(), []);
  const [synced, setSynced] = useState(false);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [activeColor, setActiveColor] = useState('#FF5A36');
  
  const svgRef = useRef<SVGSVGElement>(null);
  const currentStrokeRef = useRef<DrawStroke | null>(null);

  const [inkTrail, setInkTrail] = useState<InkPoint[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 300, y: 200 });

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

  useEffect(() => {
    const fadeTimer = setInterval(() => {
      const now = Date.now();
      setInkTrail(prev => prev.filter(p => now - p.timestamp < 600));
    }, 50);

    return () => clearInterval(fadeTimer);
  }, []);

  const getCoordinates = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const addInkTrailPoint = (pos: { x: number; y: number }) => {
    setInkTrail(prev => [
      ...prev.slice(-25),
      {
        x: pos.x,
        y: pos.y,
        id: crypto.randomUUID(),
        color: activeColor,
        timestamp: Date.now(),
      }
    ]);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getCoordinates(e);
    setCursorPos(pos);
    addInkTrailPoint(pos);

    const newStroke: DrawStroke = {
      id: crypto.randomUUID(),
      color: activeColor,
      width: 4,
      points: [pos],
    };
    currentStrokeRef.current = newStroke;
    engine.addStroke(newStroke);
    updateLocalStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pos = getCoordinates(e);
    setCursorPos(pos);

    if (currentStrokeRef.current) {
      addInkTrailPoint(pos);
      const updatedStroke = {
        ...currentStrokeRef.current,
        points: [...currentStrokeRef.current.points, pos]
      };
      currentStrokeRef.current = updatedStroke;
      engine.addStroke(updatedStroke);
      updateLocalStrokes();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    currentStrokeRef.current = null;
  };

  if (!synced) {
    return <CuriousLoading message="Opening shared whiteboard & syncing felt pens..." />;
  }

  return (
    <div className="w-full h-full relative flex flex-col" style={{ background: 'var(--color-paper-card)' }}>
      <CursorTag
        id="whiteboard-me"
        name="You"
        action="drawing"
        color={activeColor}
        x={cursorPos.x}
        y={cursorPos.y + 40}
      />

      {/* Toolbar Controls with Boxicons */}
      <div
        style={{
          padding: '0.6rem 1rem',
          background: 'var(--color-paper)',
          borderBottom: '1.5px solid var(--color-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }} className="flex items-center gap-1">
            <i className="bx bx-pencil" style={{ fontSize: '0.95rem' }}></i>
            Felt Pen:
          </span>
          <button
            onClick={() => setActiveColor('#FF5A36')}
            style={{
              width: 24,
              height: 24,
              borderRadius: '3px 0px 3px 3px',
              background: '#FF5A36',
              border: activeColor === '#FF5A36' ? '2px solid #14141A' : 'none',
              cursor: 'pointer',
            }}
            title="Coral Ink"
          />
          <button
            onClick={() => setActiveColor('#00A896')}
            style={{
              width: 24,
              height: 24,
              borderRadius: '3px 0px 3px 3px',
              background: '#00A896',
              border: activeColor === '#00A896' ? '2px solid #14141A' : 'none',
              cursor: 'pointer',
            }}
            title="Teal Ink"
          />
          <button
            onClick={() => setActiveColor('#F4B43D')}
            style={{
              width: 24,
              height: 24,
              borderRadius: '3px 0px 3px 3px',
              background: '#F4B43D',
              border: activeColor === '#F4B43D' ? '2px solid #14141A' : 'none',
              cursor: 'pointer',
            }}
            title="Mustard Ink"
          />
          <button
            onClick={() => setActiveColor('#14141A')}
            style={{
              width: 24,
              height: 24,
              borderRadius: '3px 0px 3px 3px',
              background: '#14141A',
              border: activeColor === '#14141A' ? '2px solid #FF5A36' : 'none',
              cursor: 'pointer',
            }}
            title="Dark Jet Ink"
          />
        </div>

        <button 
          onClick={() => { engine.clear(); updateLocalStrokes(); }}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <i className="bx bx-trash" style={{ fontSize: '0.9rem' }}></i>
          <span>Clear Whiteboard</span>
        </button>
      </div>

      <svg
        ref={svgRef}
        className="flex-1 w-full cursor-crosshair touch-none"
        style={{ background: 'var(--color-paper-card)' }}
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

        {inkTrail.map((pt, idx) => {
          const age = Date.now() - pt.timestamp;
          const opacity = Math.max(0, 1 - age / 600);
          const radius = Math.max(1, 7 * (1 - age / 600));

          return (
            <circle
              key={pt.id + idx}
              cx={pt.x}
              cy={pt.y}
              r={radius}
              fill={pt.color}
              opacity={opacity * 0.75}
              style={{ filter: 'blur(1px)' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
