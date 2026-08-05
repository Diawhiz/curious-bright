import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import websiteLogo from '../assets/website-logo.svg';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string;
}

export default function Sidebar({ isOpen, closeSidebar }: { isOpen?: boolean; closeSidebar?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const getToken = () => {
    return localStorage.getItem('token') || 
      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);

    if (token && !user) {
      apiFetch('/auth/me')
        .then((userData: any) => {
          if (userData?.id) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }

    if (closeSidebar) closeSidebar();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header — official wordmark */}
      <div className="sidebar-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--color-line)' }}>
        <Link to="/browse" style={{ textDecoration: 'none', display: 'block' }}>
          <img
            src={websiteLogo}
            alt="Curious Bright"
            style={{ height: 44, width: 'auto', maxWidth: '100%', display: 'block' }}
          />
        </Link>
      </div>

      {/* Global Search Bar with Boxicon */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search books, study rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: '2.2rem',
            fontSize: '0.8125rem',
            background: 'var(--color-paper)',
            borderColor: 'var(--color-line)',
          }}
        />
        <i
          className="bx bx-search"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.6,
            fontSize: '1rem',
            color: 'var(--color-ink)',
          }}
        ></i>
      </form>

      {/* Navigation Links with Consistent Boxicons */}
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-faded-ink)', marginBottom: '0.25rem' }}>
          Workspace
        </div>
        
        <Link
          to="/browse"
          className={`btn ${isActive('/browse') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
        >
          <i className="bx bx-book-open" style={{ fontSize: '1.15rem' }}></i>
          <span>Open Library</span>
        </Link>

        <Link
          to="/community"
          className={`btn ${isActive('/community') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
        >
          <i className="bx bx-conversation" style={{ fontSize: '1.15rem' }}></i>
          <span>Study Rooms</span>
        </Link>

        <Link
          to="/submit"
          className={`btn ${isActive('/submit') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
        >
          <i className="bx bx-upload" style={{ fontSize: '1.15rem' }}></i>
          <span>Share a Paper</span>
        </Link>

        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-faded-ink)', marginTop: '1.25rem', marginBottom: '0.25rem' }}>
          Review Queue
        </div>

        <Link
          to="/moderate"
          className={`btn ${isActive('/moderate') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
        >
          <i className="bx bx-shield-quarter" style={{ fontSize: '1.15rem' }}></i>
          <span>Community Review</span>
        </Link>
      </nav>

      {/* User Card */}
      <div
        style={{
          marginTop: 'auto',
          padding: '0.85rem',
          background: 'var(--color-paper)',
          border: '1.5px solid var(--color-line)',
          borderRadius: '4px 0px 4px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '3px 0px 3px 3px',
                  background: 'var(--color-coral)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div className="font-semibold text-xs text-truncate" style={{ color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Writer'}
                </div>
                <span className="badge-tag badge-teal" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                  {user?.schoolName || 'Co-author'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flexShrink: 0 }}
            >
              Log out
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2" style={{ width: '100%' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-faded-ink)', textAlign: 'center' }}>
              Join co-authors & study rooms
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}>
                Join now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Legal links */}
      <div className="sidebar-legal-links">
        <Link to="/privacy">Privacy</Link>
        <span style={{ opacity: 0.3 }}>•</span>
        <Link to="/terms">Terms</Link>
        <span style={{ opacity: 0.3 }}>•</span>
        <a href="https://curiousbright.com.ng" target="_blank" rel="noopener noreferrer">Home</a>
      </div>
    </aside>
  );
}
