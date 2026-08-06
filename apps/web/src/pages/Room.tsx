import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { apiFetch } from '../lib/api';
import { Whiteboard } from '../components/Whiteboard';
import { VideoCall } from '../components/VideoCall';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { CursorTag } from '../components/CursorTag';


interface Message {
  id: string;
  senderName: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface RoomInfo {
  id: string;
  name: string;
  topic: string;
}

interface Member {
  id: string;
  user: {
    id: string;
    name: string;
    schoolName?: string;
    role: string;
  };
  isAdmin?: boolean;
}

interface ActiveUser {
  userId: string;
  name: string;
}

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'CHAT' | 'WHITEBOARD' | 'VIDEO'>('CHAT');
  const [callToken, setCallToken] = useState<string | null>(null);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoPiP, setVideoPiP] = useState(false); // floating overlay mode
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'unauthenticated' | 'error'>('connecting');

  const [roomCursors, setRoomCursors] = useState([
    { id: '101', name: 'Amara', action: 'writing', color: '#FF5A36', x: 220, y: 140 },
    { id: '102', name: 'Mateo', action: 'in whiteboard', color: '#00A896', x: 480, y: 220 },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setRoomCursors(prev => prev.map(c => ({
        ...c,
        x: Math.min(600, Math.max(60, c.x + (Math.random() * 120 - 60))),
        y: Math.min(400, Math.max(80, c.y + (Math.random() * 80 - 40))),
      })));
    }, 3600);

    return () => clearInterval(cursorTimer);
  }, []);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/rooms`)
      .then((data: any[]) => {
        const found = data.find(r => r.id === id);
        if (found) setRoomInfo(found);
      })
      .catch(() => {});

    fetchMembers();

    apiFetch('/users/blocked')
      .then((data: any[]) => {
        const blockedIds = new Set(data.map(b => b.blockedId));
        setBlockedUsers(blockedIds as Set<string>);
      })
      .catch(err => console.error(err));

    apiFetch(`/rooms/${id}/join`, { method: 'POST' })
      .then(() => fetchMembers())
      .catch(() => {});

    apiFetch(`/rooms/${id}/messages`)
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setMessages(data.map(m => ({
            id: m.id,
            senderName: m.sender?.name || 'Writer',
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
          })).reverse());
        }
      })
      .catch(err => console.error('Failed to load messages', err));

    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      setSocketStatus('unauthenticated');
      return;
    }

    const realtimeUrl = import.meta.env.VITE_REALTIME_URL || 'http://localhost:4001';
    const newSocket = io(realtimeUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setSocketStatus('connected');
      newSocket.emit('room:join', id);
    });

    newSocket.on('reconnect', () => {
      setSocketStatus('connected');
      newSocket.emit('room:join', id);
    });

    newSocket.on('reconnect_attempt', () => {
      setSocketStatus('connecting');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Don't set permanent error — let it retry
      setSocketStatus('connecting');
    });

    newSocket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server actively disconnected — try to reconnect manually
        newSocket.connect();
      }
      setSocketStatus('connecting');
    });

    newSocket.on('room:presence', (activeList: ActiveUser[]) => {
      setOnlineUsers(activeList);
    });

    newSocket.on(RealtimeEvents.MESSAGE_RECEIVE, (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const fetchMembers = async () => {
    try {
      const data = await apiFetch(`/rooms/${id}/members`);
      if (Array.isArray(data)) {
        setMembers(data);
      }
    } catch (e) {
      console.warn('Failed to fetch room members', e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit(RealtimeEvents.MESSAGE_SEND, {
      roomId: id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const startVideoCall = async () => {
    try {
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        setError('Please sign in to join video calls with co-authors');
        return;
      }

      const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:4002';
      const res = await fetch(`${signalingUrl}/api/call/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId: id }),
      });
      const data = await res.json();
      if (data.token) {
        setCallToken(data.token);
        setVideoCallActive(true);
        setActiveTab('VIDEO');
      } else {
        setError(data.error || 'Failed to start video session');
      }
    } catch (err: any) {
      console.error('Failed to get call token', err);
      setError('Video call service is unavailable');
    }
  };

  const leaveVideoCall = () => {
    setCallToken(null);
    setVideoCallActive(false);
    setVideoPiP(false);
    if (activeTab === 'VIDEO') setActiveTab('CHAT');
  };

  const toggleVideoPiP = () => {
    if (!videoPiP) {
      // Switch to whiteboard (or chat) and show floating pip
      setVideoPiP(true);
      if (activeTab === 'VIDEO') setActiveTab('WHITEBOARD');
    } else {
      setVideoPiP(false);
      setActiveTab('VIDEO');
    }
  };

  const onlineUserIds = new Set(onlineUsers.map(u => u.userId));

  return (
    <div className="room-main-container">
      {roomCursors.map(c => (
        <CursorTag key={c.id} id={c.id} name={c.name} action={c.action} color={c.color} x={c.x} y={c.y} />
      ))}

      {/* Room Header Top Bar with Boxicons */}
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="flex items-center gap-3">
          <Link to="/community" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}>
            <i className="bx bx-left-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
            <span>Back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: '1.35rem' }}>{roomInfo?.name || 'Study Room'}</h2>
              {roomInfo?.topic && <span className="badge-tag badge-mustard">{roomInfo.topic}</span>}
            </div>
          </div>
        </div>

        {/* Action Controls & Tab Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', borderColor: showMembersPanel ? 'var(--color-ink)' : undefined }}
            onClick={() => setShowMembersPanel(prev => !prev)}
          >
            <i className="bx bx-group" style={{ fontSize: '1.1rem' }}></i>
            <span>Members ({members.length})</span>
            {onlineUsers.length > 0 && <span className="badge-tag badge-teal" style={{ marginLeft: 4 }}>{onlineUsers.length} Active now</span>}
          </button>

          {/* Mode Tabs with Boxicons */}
          <div className="flex gap-1" style={{ background: 'var(--color-paper-card)', padding: '0.25rem', borderRadius: '4px 0px 4px 4px', border: '1.5px solid var(--color-line)' }}>
            <button 
              className={`btn ${activeTab === 'CHAT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
              onClick={() => setActiveTab('CHAT')}
            >
              <i className="bx bx-chat" style={{ fontSize: '1rem' }}></i>
              <span>Conversation</span>
            </button>
            <button 
              className={`btn ${activeTab === 'WHITEBOARD' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
              onClick={() => setActiveTab('WHITEBOARD')}
            >
              <i className="bx bx-palette" style={{ fontSize: '1rem' }}></i>
              <span>Whiteboard</span>
            </button>
            <button 
              className={`btn ${activeTab === 'VIDEO' && !videoPiP ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem', position: 'relative' }}
              onClick={videoCallActive ? (videoPiP ? () => { setVideoPiP(false); setActiveTab('VIDEO'); } : () => setActiveTab('VIDEO')) : startVideoCall}
            >
              <i className="bx bx-video" style={{ fontSize: '1rem' }}></i>
              <span>{videoCallActive ? (videoPiP ? 'Expand Video' : 'Video Active') : 'Start Call'}</span>
              {videoCallActive && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', position: 'absolute', top: 5, right: 5, boxShadow: '0 0 0 2px #fff' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <span className="flex items-center gap-1.5">
            <i className="bx bx-error-circle" style={{ fontSize: '1.1rem' }}></i>
            {error}
          </span>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Unauthenticated Alert */}
      {socketStatus === 'unauthenticated' && (
        <div className="alert alert-info mb-4">
          <span className="flex items-center gap-1.5">
            <i className="bx bx-lock-alt" style={{ fontSize: '1.1rem' }}></i>
            You are viewing this room as a guest. Sign in to post messages, draw on the whiteboard, and join video calls.
          </span>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
            <span>Sign In</span>
            <i className="bx bx-right-arrow-alt" style={{ fontSize: '1rem' }}></i>
          </Link>
        </div>
      )}

      {/* Main Room Workspace Pane */}
      <div className="room-workspace-pane">
        <CommentCornerCard style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* CHAT TAB */}
          {activeTab === 'CHAT' && (
            <div className="flex flex-col h-full">
              {/* Connection Status Bar */}
              <div style={{ padding: '0.6rem 1.25rem', background: 'var(--color-paper)', borderBottom: '1.5px solid var(--color-line)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-2">
                  <span className="badge-tag badge-teal" style={{ fontSize: '0.6875rem' }}>
                    {socketStatus === 'connected' ? 'Connected to workspace' : socketStatus === 'unauthenticated' ? 'Guest Mode' : 'Connecting...'}
                  </span>
                  <span className="text-muted">
                    Everyone sees your changes instantly
                  </span>
                </div>
                <span className="text-muted font-medium">
                  {onlineUsers.length} co-authors in room
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.filter(msg => !blockedUsers.has(msg.senderId)).length === 0 ? (
                  <div className="text-center text-muted flex items-center justify-center gap-1.5" style={{ margin: 'auto', fontSize: '0.9375rem' }}>
                    <i className="bx bx-chat" style={{ fontSize: '1.25rem' }}></i>
                    No notes in this room yet. Write a message below to start collaborating!
                  </div>
                ) : (
                  messages.filter(msg => !blockedUsers.has(msg.senderId)).map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div className="flex items-center gap-2">
                        <span className="badge-tag badge-coral" style={{ fontSize: '0.6875rem' }}>
                          {msg.senderName}
                        </span>
                        {msg.createdAt && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-faded-ink)' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          background: 'var(--color-paper)',
                          border: '1.5px solid var(--color-line)',
                          padding: '0.65rem 0.95rem',
                          borderRadius: '4px 0px 4px 4px',
                          maxWidth: '85%',
                          width: 'fit-content',
                          fontSize: '0.9375rem',
                          lineHeight: '1.45',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.25rem', borderTop: '1.5px solid var(--color-line)', background: 'var(--color-paper)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={socketStatus === 'unauthenticated' ? 'Sign in to write a message...' : 'Write a note or mention a co-author...'}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={socketStatus === 'unauthenticated'}
                  style={{ flex: 1 }}
                />
                {socketStatus === 'unauthenticated' ? (
                  <Link to="/login" className="btn btn-primary">
                    Sign In
                  </Link>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                    <span>Post Note</span>
                    <i className="bx bx-paper-plane" style={{ fontSize: '1rem' }}></i>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* WHITEBOARD TAB */}
          {activeTab === 'WHITEBOARD' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Whiteboard roomId={id!} socket={socket} />
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'VIDEO' && callToken && !videoPiP && (
            <div style={{ width: '100%', height: '100%', background: 'var(--color-paper-card)' }}>
              <VideoCall 
                roomId={id!} 
                token={callToken}
                onPiP={toggleVideoPiP}
                onLeave={leaveVideoCall}
              />
            </div>
          )}
        </CommentCornerCard>

        {/* Right Members Panel */}
        {showMembersPanel && (
          <CommentCornerCard className="room-members-panel">
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1.5px solid var(--color-line)' }}>
              <h4 style={{ fontSize: '0.95rem' }} className="flex items-center gap-1.5">
                <i className="bx bx-group" style={{ fontSize: '1.1rem' }}></i>
                Room Members ({members.length})
              </h4>
              <span className="badge-tag badge-teal" style={{ fontSize: '0.625rem' }}>
                {onlineUsers.length} Active
              </span>
            </div>

            {members.length === 0 ? (
              <div className="text-center text-muted text-xs" style={{ padding: '2rem 0' }}>
                No members joined yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {members.map(m => {
                  const isOnline = onlineUserIds.has(m.user.id);
                  return (
                    <div 
                      key={m.id} 
                      className="flex items-center justify-between"
                      style={{ 
                        padding: '0.55rem 0.7rem', 
                        borderRadius: '4px 0px 4px 4px', 
                        background: 'var(--color-paper)',
                        border: '1.5px solid var(--color-line)'
                      }}
                    >
                      <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '3px 0px 3px 3px',
                            background: isOnline ? 'var(--color-coral)' : 'var(--color-faded-ink)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {m.user.name?.[0]?.toUpperCase() || 'M'}
                        </div>

                        <div style={{ overflow: 'hidden' }}>
                          <div className="font-semibold text-xs flex items-center gap-1" style={{ color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.user.name} {m.isAdmin && <i className="bx bxs-star" style={{ color: 'var(--color-mustard)', fontSize: '0.75rem' }}></i>}
                          </div>
                          <div className="text-xs text-muted" style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.user.schoolName || 'Co-author'}
                          </div>
                        </div>
                      </div>

                      <span className={`badge-tag ${isOnline ? 'badge-teal' : 'badge-mustard'}`} style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                        {isOnline ? 'Active' : 'Member'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CommentCornerCard>
        )}
      </div>

      {/* Floating Picture-in-Picture Video Overlay */}
      {videoPiP && callToken && (
        <div className="vc-pip-panel">
          {/* PiP header bar */}
          <div className="vc-pip-header">
            <span className="vc-live-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              <span className="vc-live-dot" />
              Video Call Active
            </span>
            <div className="vc-pip-actions">
              <button
                className="vc-pip-action-btn"
                onClick={() => { setVideoPiP(false); setActiveTab('VIDEO'); }}
                title="Expand to full view"
              >
                <i className="bx bx-expand" style={{ fontSize: '0.85rem' }} />
              </button>
              <button
                className="vc-pip-action-btn danger"
                onClick={leaveVideoCall}
                title="Leave call"
              >
                <i className="bx bx-phone-off" style={{ fontSize: '0.85rem' }} />
              </button>
            </div>
          </div>
          {/* Embedded compact video */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <VideoCall
              roomId={id!}
              token={callToken}
              onPiP={toggleVideoPiP}
              onLeave={leaveVideoCall}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

