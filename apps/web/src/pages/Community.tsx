import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty } from '../components/CuriousStates';

interface Room {
  id: string;
  name: string;
  topic: string;
  isPrivate: boolean;
  memberCount?: number;
  activeCount?: number;
}

export default function Community() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/rooms');
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (e) {
      console.error('Failed to load study rooms', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newRoomName.trim()) return;

    try {
      const created = await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: newRoomName.trim(),
          topic: newRoomTopic.trim() || 'General Study',
        }),
      });

      if (created?.id) {
        setShowCreateModal(false);
        setNewRoomName('');
        setNewRoomTopic('');
        fetchRooms();
      }
    } catch (err: any) {
      setCreateError(err.message || 'Could not create study room');
    }
  };

  return (
    <div>
      {/* Header with Boxicons */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>
            <HighlighterText color="#00A896">Collaborative Study Rooms</HighlighterText>
          </h2>
          <p className="text-muted text-sm mt-2">
            Join co-authors and scholars in real-time reading sessions, whiteboards, and video calls.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}
        >
          <i className="bx bx-plus" style={{ fontSize: '1.1rem' }}></i>
          <span>Create Study Room</span>
        </button>
      </div>

      {loading ? (
        <CuriousLoading message="Fetching active study rooms & co-author sessions..." />
      ) : rooms.length === 0 ? (
        <CuriousEmpty
          title="No Active Study Rooms Yet"
          description="Create the first study room for your subject or manuscript!"
          flourishText="Study Rooms"
          actionButton={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="bx bx-plus" style={{ fontSize: '1.1rem' }}></i>
              <span>Create First Room</span>
            </button>
          }
        />
      ) : (
        <div className="grid-container">
          {rooms.map(room => (
            <CommentCornerCard
              key={room.id}
              commentPreview="Peel corner to view active co-authors"
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge-tag badge-mustard">
                    {room.topic || 'General Topic'}
                  </span>
                  <span className="badge-tag badge-teal" style={{ fontSize: '0.625rem' }}>
                    Active Workspace
                  </span>
                </div>

                <h3 className="mb-2" style={{ fontSize: '1.15rem' }}>{room.name}</h3>

                <p className="text-muted text-sm mb-4">
                  Shared study space equipped with real-time text chat, interactive whiteboard, and video call support.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <i className="bx bx-group" style={{ fontSize: '0.95rem' }}></i>
                  Open Access
                </span>
                <Link to={`/room/${room.id}`} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}>
                  <span>Join Room</span>
                  <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
                </Link>
              </div>
            </CommentCornerCard>
          ))}
        </div>
      )}

      {/* Create Room Modal with Boxicons */}
      {showCreateModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 20, 26, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', width: '100%' }}>
            <CommentCornerCard style={{ padding: '1.75rem' }}>
              <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1.5px solid var(--color-line)' }}>
                <h3 style={{ fontSize: '1.2rem' }} className="flex items-center gap-1.5">
                  <i className="bx bx-conversation" style={{ fontSize: '1.25rem' }}></i>
                  Create Study Room
                </h3>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <i className="bx bx-x" style={{ fontSize: '1.1rem' }}></i>
                </button>
              </div>

              {createError && (
                <div className="alert alert-error mb-4">
                  <span className="flex items-center gap-1">
                    <i className="bx bx-error-circle" style={{ fontSize: '1rem' }}></i>
                    {createError}
                  </span>
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Room Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Quantum Physics Chapter 3 Discussion"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Subject or Topic Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Physics, Literature, Organic Chemistry"
                    value={newRoomTopic}
                    onChange={e => setNewRoomTopic(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3" style={{ borderTop: '1.5px solid var(--color-line)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!newRoomName.trim()}>
                    <span>Create Room</span>
                    <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
                  </button>
                </div>
              </form>
            </CommentCornerCard>
          </div>
        </div>
      )}
    </div>
  );
}
