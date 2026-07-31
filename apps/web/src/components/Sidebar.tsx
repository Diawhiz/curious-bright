import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string;
}

export default function Sidebar() {
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
          // Token expired or invalid
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
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
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="sidebar-brand-icon">✨</div>
          <span>CuriousBright</span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="sidebar-search">
        <span className="sidebar-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search books, rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        
        <Link to="/browse" className={`sidebar-nav-item ${isActive('/browse') ? 'active' : ''}`}>
          <span className="sidebar-nav-icon">📚</span>
          <span>Open Library</span>
        </Link>

        <Link to="/community" className={`sidebar-nav-item ${isActive('/community') ? 'active' : ''}`}>
          <span className="sidebar-nav-icon">💬</span>
          <span>Study Rooms</span>
        </Link>

        <Link to="/submit" className={`sidebar-nav-item ${isActive('/submit') ? 'active' : ''}`}>
          <span className="sidebar-nav-icon">📤</span>
          <span>Submit Paper</span>
        </Link>

        <Link to="/about" className={`sidebar-nav-item ${isActive('/about') ? 'active' : ''}`}>
          <span className="sidebar-nav-icon">ℹ️</span>
          <span>About</span>
        </Link>

        <div className="nav-section-title" style={{ marginTop: '1rem' }}>Admin</div>

        {(user?.role === 'MODERATOR' || user?.role === 'ADMIN') && (
          <>
            <Link to="/moderate" className={`sidebar-nav-item ${isActive('/moderate') ? 'active' : ''}`}>
              <span className="sidebar-nav-icon">🛡️</span>
              <span>Moderation</span>
            </Link>

            <Link to="/mod-login" className={`sidebar-nav-item ${isActive('/mod-login') ? 'active' : ''}`}>
              <span className="sidebar-nav-icon">🔐</span>
              <span>Mod Login</span>
            </Link>
          </>
        )}

        {(!user?.role || user?.role === 'USER' || user?.role === 'EXPERT') && (
          <>
            <Link to="/apply-moderator" className={`sidebar-nav-item ${isActive('/apply-moderator') ? 'active' : ''}`}>
              <span className="sidebar-nav-icon">📝</span>
              <span>Apply as Mod</span>
            </Link>
            
            <Link to="/apply-institution" className={`sidebar-nav-item ${isActive('/apply-institution') ? 'active' : ''}`}>
              <span className="sidebar-nav-icon">🏛️</span>
              <span>For Institutions</span>
            </Link>
          </>
        )}
      </nav>

      {/* User / Auth Bottom Card */}
      <div className="sidebar-user-card">
        {isAuthenticated ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              <div style={{ width: 32, height: 32, border: '1.5px solid var(--color-border-dark)', background: 'var(--color-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Account'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.schoolName || 'Member'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', flexShrink: 0 }}
            >
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Access study rooms & whiteboards
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
