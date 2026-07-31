import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          schoolName: schoolName.trim() || undefined,
        }),
      });

      if (data?.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        document.cookie = `token=${data.token}; path=/; max-age=604800;`;
        navigate('/browse');
      } else {
        setError('Registration succeeded, please sign in.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2.5rem auto' }}>
      <div className="text-center mb-6">
        <h2>
          <HighlighterText color="#FF5A36">Join Curious Bright</HighlighterText>
        </h2>
        <p className="text-muted text-sm mt-2">
          Create your co-author profile to write notes and join collaborative study rooms.
        </p>
      </div>

      <CommentCornerCard commentPreview="Open access co-author registration">
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
              Full Name / Pen Name
            </label>
            <input
              type="text"
              placeholder="e.g., Prof. Sarah Chen"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Academic Email Address
            </label>
            <input
              type="email"
              placeholder="e.g., sarah@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Institution / School (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Oxford University, High School Senior"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading || !name.trim() || !email.trim() || !password}
            style={{ padding: '0.65rem', fontSize: '0.875rem' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '1rem' }}></i>
                Creating Co-author Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Create Co-author Account</span>
                <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3" style={{ borderTop: '1.5px solid var(--color-line)', fontSize: '0.8125rem' }}>
          <span className="text-muted">Already registered? </span>
          <Link to="/login" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </CommentCornerCard>
    </div>
  );
}
