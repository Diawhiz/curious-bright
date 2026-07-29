import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

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
      setError(e.message || 'Failed to connect to community service');
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
        setCreateError('Please log in to create a study room.');
      } else {
        setCreateError(e.message || 'Failed to create room.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2>Community Rooms</h2>
        <p className="text-muted text-sm mt-2">Join topic-based study groups, real-time whiteboards, and video calls</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={loadRooms}>
            Retry
          </button>
        </div>
      )}

      {/* Create Room Form */}
      <div className="glass-card mb-8">
        <h3 className="mb-2">Create a Study Room</h3>
        <p className="text-muted text-sm mb-4">Start a public room for collaborative study, whiteboard sketching, or discussions.</p>
        
        {createError && (
          <div className="alert alert-warning">
            <span>ℹ️ {createError}</span>
            {createError.includes('log in') && (
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                Go to Login
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <div className="flex-1" style={{ minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Room Name (e.g. Quantum Physics 101)"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1" style={{ minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Topic (e.g. Physics, Calculus, CS)"
              value={newRoomTopic}
              onChange={e => setNewRoomTopic(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Creating...' : '+ Create Room'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading study rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No Study Rooms Available</div>
          <div className="empty-state-desc">
            There are no active public rooms yet. Create the first room above to start collaborating!
          </div>
        </div>
      ) : (
        /* Rooms Grid */
        <div className="grid-container">
          {rooms.map(room => (
            <div key={room.id} className="glass-card glass-card-interactive flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge badge-level">
                    {room.topic || 'General'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-marginnote">
                    <span className="inline-block w-2 h-2 rounded-full bg-marginnote animate-pulse"></span>
                    Live Room • {room._count?.members ?? 0} {room._count?.members === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
                <h3 className="mb-2 font-display">{room.name}</h3>

              </div>

              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
                <Link
                  to={`/room/${room.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Join Room →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
