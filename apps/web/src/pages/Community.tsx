import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty, CuriousError } from '../components/CuriousStates';

interface Room {
  id: string;
  name: string;
  topic: string;
  _count?: { members: number };
}

export default function Community() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/rooms');
      setRooms(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Failed to load rooms', e);
      setError(e.message || 'Failed to connect to community study rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TOPIC',
          name: newRoomName.trim(),
          topic: newRoomTopic.trim(),
          isPublic: true,
        }),
      });
      setNewRoomName('');
      setNewRoomTopic('');
      loadRooms();
    } catch (e: any) {
      if (e.message === 'Unauthorized' || e.message.includes('401')) {
        setCreateError('Please sign in to start a study room.');
      } else {
        setCreateError(e.message || 'Failed to create study room.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2>
          <HighlighterText color="#F4B43D">Study Rooms & Co-authors</HighlighterText>
        </h2>
        <p className="text-muted text-sm mt-2">
          Join topic-based study groups with shared whiteboards, live margin notes, and video sessions.
        </p>
      </div>

      {/* Error Alert */}
      {error && <CuriousError title="Community Connection Error" message={error} onRetry={loadRooms} />}

      {/* Create Room Form */}
      <CommentCornerCard commentPreview="Peel corner to start a new study group" className="mb-8">
        <h3 className="mb-2">Start a Study Room</h3>
        <p className="text-muted text-sm mb-4">Open a public room for shared writing, whiteboard sketching, or discussions.</p>
        
        {createError && (
          <div className="alert alert-info">
            <span>ℹ️ {createError}</span>
            {createError.includes('sign in') && (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                Sign In →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <div className="flex-1" style={{ minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Room Name (e.g. Quantum Physics Notebook)"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1" style={{ minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Topic (e.g. Physics, Calculus, Literature)"
              value={newRoomTopic}
              onChange={e => setNewRoomTopic(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Opening room...' : '+ Create Room'}
          </button>
        </form>
      </CommentCornerCard>

      {/* Loading State */}
      {loading ? (
        <CuriousLoading message="Opening active study rooms..." />
      ) : rooms.length === 0 ? (
        /* Empty State */
        <CuriousEmpty
          title="No Study Rooms Active Yet"
          description="There are currently no active public study rooms. Be the first to start a room above!"
          flourishText="Study Rooms"
        />
      ) : (
        /* Rooms Grid — Zero Status Dots! */
        <div className="grid-container">
          {rooms.map(room => (
            <CommentCornerCard
              key={room.id}
              commentPreview={`Room note: ${room.name}. Click to join workspace.`}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge-tag badge-mustard">
                    {room.topic || 'General Topic'}
                  </span>
                  <span className="badge-tag badge-teal">
                    {room._count?.members ?? 0} {room._count?.members === 1 ? 'Co-author' : 'Co-authors'}
                  </span>
                </div>
                <h3 className="mb-2">{room.name}</h3>
              </div>

              <div className="pt-4 mt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
                <Link
                  to={`/room/${room.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Join Room →
                </Link>
              </div>
            </CommentCornerCard>
          ))}
        </div>
      )}
    </div>
  );
}
