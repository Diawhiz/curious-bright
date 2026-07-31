import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (data?.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/browse');
    } catch (err: any) {
      setError(err.message || 'Check your email and password to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <CommentCornerCard commentPreview="Welcome back to Curious Bright">
        <h2 className="text-center mb-2">
          <HighlighterText color="#F4B43D">Welcome Back</HighlighterText>
        </h2>
        <p className="text-center text-muted text-sm mb-6">Sign in to open your shared notebooks and study rooms</p>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="text-center mt-6 pt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
          <span className="text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>Join co-authors</Link>
          </span>
        </div>
      </CommentCornerCard>
    </div>
  );
}
