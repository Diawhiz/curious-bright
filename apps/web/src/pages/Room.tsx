import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { apiFetch } from '../lib/api';
import { Whiteboard } from '../components/Whiteboard';
import { VideoCall } from '../components/VideoCall';

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
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'unauthenticated' | 'error'>('connecting');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch room details
    apiFetch(`/rooms`)
      .then((data: any[]) => {
        const found = data.find(r => r.id === id);
        if (found) setRoomInfo(found);
      })
      .catch(() => {});

    // Fetch room members
    fetchMembers();

    // Fetch blocked users
    apiFetch('/users/blocked')
      .then((data: any[]) => {
        const blockedIds = new Set(data.map(b => b.blockedId));
        setBlockedUsers(blockedIds as Set<string>);
      })
      .catch(err => console.error(err));

    // Join room in backend first to ensure membership
    apiFetch(`/rooms/${id}/join`, { method: 'POST' })
      .then(() => fetchMembers())
      .catch(() => {});

    // Fetch message history
    apiFetch(`/rooms/${id}/messages`)
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setMessages(data.map(m => ({
            id: m.id,
            senderName: m.sender?.name || 'Anonymous',
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
          })).reverse());
        }
      })
      .catch(err => console.error('Failed to load messages', err));

    // Parse auth token from cookie
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      setSocketStatus('unauthenticated');
      return;
    }

    // Connect to realtime gateway
    const realtimeUrl = import.meta.env.VITE_REALTIME_URL || 'http://localhost:4001';
    const newSocket = io(realtimeUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setSocketStatus('connected');
      newSocket.emit('room:join', id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketStatus('error');
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
        setError('Please log in to start a video call');
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
        setActiveTab('VIDEO');
      } else {
        setError(data.error || 'Failed to start video call session');
      }
    } catch (err: any) {
      console.error('Failed to get call token', err);
      setError('Video call service is unavailable');
    }
  };

  const onlineUserIds = new Set(onlineUsers.map(u => u.userId));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Room Header Top Bar */}
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="flex items-center gap-3">
          <Link to="/community" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
            ← Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: '1.25rem' }}>{roomInfo?.name || 'Study Room'}</h2>
              {roomInfo?.topic && <span className="badge badge-level">{roomInfo.topic}</span>}
            </div>
          </div>
        </div>

        {/* Action Controls & Tab Selector */}
        <div className="flex items-center gap-3">
          {/* Members Toggle Button */}
          <button 
            className={`btn ${showMembersPanel ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', borderColor: showMembersPanel ? 'var(--accent)' : undefined }}
            onClick={() => setShowMembersPanel(prev => !prev)}
          >
            👥 Members ({members.length}) {onlineUsers.length > 0 && <span style={{ color: 'var(--success)', fontWeight: 700 }}>• {onlineUsers.length} Online</span>}
          </button>

          {/* Mode Tabs */}
          <div className="flex gap-1" style={{ background: 'var(--glass-bg)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <button 
              className={`btn ${activeTab === 'CHAT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
              onClick={() => setActiveTab('CHAT')}
            >
              💬 Chat
            </button>
            <button 
              className={`btn ${activeTab === 'WHITEBOARD' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
              onClick={() => setActiveTab('WHITEBOARD')}
            >
              🎨 Whiteboard
            </button>
            <button 
              className={`btn ${activeTab === 'VIDEO' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
              onClick={callToken ? () => setActiveTab('VIDEO') : startVideoCall}
            >
              📹 {callToken ? 'Video Call (Active)' : 'Start Call'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Unauthenticated Alert */}
      {socketStatus === 'unauthenticated' && (
        <div className="alert alert-warning mb-4">
          <span>🔒 You are viewing this room as a guest. Please log in to participate in real-time chat, whiteboard editing, and video calling.</span>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
            Sign In →
          </Link>
        </div>
      )}

      {/* Main Room Container (Flex Workspace + Right Members Panel) */}
      <div className="flex-1 flex gap-4" style={{ overflow: 'hidden' }}>
        {/* Main Content Pane */}
        <div className="glass-card flex-1 flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
          {/* CHAT TAB */}
          {activeTab === 'CHAT' && (
            <div className="flex flex-col h-full">
              {/* Connection Status Bar */}
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: socketStatus === 'connected' ? 'var(--success)' : socketStatus === 'unauthenticated' ? 'var(--warning)' : 'var(--danger)' }}></span>
                  <span className="text-muted">
                    {socketStatus === 'connected' ? 'Realtime Gateway Active' : socketStatus === 'unauthenticated' ? 'Guest Mode (Read Only)' : 'Connecting to gateway...'}
                  </span>
                </div>
                <span className="text-muted">
                  {onlineUsers.length} active in room
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.filter(msg => !blockedUsers.has(msg.senderId)).length === 0 ? (
                  <div className="text-center text-muted" style={{ margin: 'auto', fontSize: '0.875rem' }}>
                    💬 No messages in this study room yet. Type below to start the conversation!
                  </div>
                ) : (
                  messages.filter(msg => !blockedUsers.has(msg.senderId)).map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>{msg.senderName}</span>
                        {msg.createdAt && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 'var(--radius-md)',
                        maxWidth: '85%',
                        width: 'fit-content',
                        fontSize: '0.9375rem',
                        lineHeight: '1.4'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={socketStatus === 'unauthenticated' ? 'Log in to send messages...' : 'Type a message or @mention a teammate...'}
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
                    Send
                  </button>
                )}
              </form>
            </div>
          )}

          {/* WHITEBOARD TAB */}
          {activeTab === 'WHITEBOARD' && (
            <div style={{ width: '100%', height: '100%' }}>
              <Whiteboard roomId={id!} socket={socket} />
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'VIDEO' && callToken && (
            <div style={{ width: '100%', height: '100%', background: '#000' }}>
              <VideoCall 
                roomId={id!} 
                token={callToken} 
                onLeave={() => {
                  setCallToken(null);
                  setActiveTab('CHAT');
                }} 
              />
            </div>
          )}
        </div>

        {/* Right Members Panel */}
        {showMembersPanel && (
          <div className="glass-card" style={{ width: '280px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.9375rem' }}>Room Members ({members.length})</h4>
              <span className="text-xs text-muted">
                🟢 {onlineUsers.length} Online
              </span>
            </div>

            {members.length === 0 ? (
              <div className="text-center text-muted text-xs" style={{ padding: '2rem 0' }}>
                No members found in this room.
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
                        padding: '0.5rem 0.65rem', 
                        borderRadius: 'var(--radius-md)', 
                        background: isOnline ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                        {/* Status Indicator Avatar */}
                        <div style={{ position: 'relative' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                            {m.user.name?.[0]?.toUpperCase() || 'M'}
                          </div>
                          {isOnline && (
                            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-dark)' }}></span>
                          )}
                        </div>

                        <div style={{ overflow: 'hidden' }}>
                          <div className="font-semibold text-xs text-truncate" style={{ color: 'var(--text-primary)' }}>
                            {m.user.name} {m.isAdmin && <span style={{ color: 'var(--warning)', fontSize: '0.65rem' }}>⭐ Admin</span>}
                          </div>
                          <div className="text-xs text-muted text-truncate" style={{ fontSize: '0.6875rem' }}>
                            {m.user.schoolName || 'Independent Learner'}
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${isOnline ? 'badge-approved' : 'badge-level'}`} style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                        {isOnline ? 'Active' : 'Member'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
