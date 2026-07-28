import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if token cookie exists
  const isAuthenticated = document.cookie.split('; ').some(row => row.startsWith('token='));

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      // Clear cookie client-side as fallback
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span style={{ fontSize: '1.25rem' }}>✨</span>
          <span>CuriousBright</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="navbar-search">
        <span className="navbar-search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search papers, rooms, users..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="navbar-links">
        <Link to="/browse" className={`navbar-link ${isActive('/browse') ? 'active' : ''}`}>Browse</Link>
        <Link to="/submit" className={`navbar-link ${isActive('/submit') ? 'active' : ''}`}>Submit Paper</Link>
        <Link to="/community" className={`navbar-link ${isActive('/community') ? 'active' : ''}`}>Community</Link>
        <Link to="/moderate" className={`navbar-link ${isActive('/moderate') ? 'active' : ''}`}>Moderate</Link>

        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className={`navbar-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
