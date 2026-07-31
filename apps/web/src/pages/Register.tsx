import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      if (form.schoolName.trim()) {
        payload.schoolName = form.schoolName.trim();
      }

      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
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
      setError(err.message || 'We could not complete your account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto' }}>
      <CommentCornerCard commentPreview="Join co-authors on Curious Bright">
        <h2 className="text-center mb-2">
          <HighlighterText color="#FF5A36">Join Curious Bright</HighlighterText>
        </h2>
        <p className="text-center text-muted text-sm mb-6">Create your co-author account to join study rooms & share papers</p>

        {error && (
          <div className="alert alert-error mb-4">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={set('name')}
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="ada@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>
              School / Institution{' '}
              <span className="text-muted" style={{ fontWeight: 400, textTransform: 'none' }}>
                (optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Oxford, Independent Learner"
              value={form.schoolName}
              onChange={set('schoolName')}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div className="text-center mt-6 pt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
          <span className="text-muted text-sm">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>Sign In</Link>
          </span>
        </div>
      </CommentCornerCard>
    </div>
  );
}
