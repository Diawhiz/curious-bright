import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data?.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        document.cookie = `token=${data.token}; path=/; max-age=604800;`;
        navigate('/browse');
      } else {
        setError('Invalid sign-in response');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="text-center mb-6">
        <h2>
          <HighlighterText color="#00A896">Welcome Back</HighlighterText>
        </h2>
        <p className="text-muted text-sm mt-2">
          Sign in to access your shared learning notebook & study rooms.
        </p>
      </div>

      <CommentCornerCard commentPreview="Secure single session co-author login">
        {error && (
          <div className="alert alert-error mb-4">
            <span className="flex items-center gap-1.5">
              <i className="bx bx-error-circle" style={{ fontSize: '1.1rem' }}></i>
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Academic Email Address
            </label>
            <input
              type="email"
              placeholder="e.g., alex@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading || !email.trim() || !password}
            style={{ padding: '0.65rem', fontSize: '0.875rem' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '1rem' }}></i>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign In</span>
                <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3" style={{ borderTop: '1.5px solid var(--color-line)', fontSize: '0.8125rem' }}>
          <span className="text-muted">Don't have an account yet? </span>
          <Link to="/register" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
            Join as co-author
          </Link>
        </div>
      </CommentCornerCard>
    </div>
  );
}
