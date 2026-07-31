import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Engineering', 'Medicine',
  'History', 'Philosophy', 'Economics', 'Literature',
  'Law', 'Psychology', 'Linguistics', 'Education',
  'Arts & Humanities', 'Political Science', 'Environmental Science',
];

type AppStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ExistingApp {
  status: AppStatus;
  motivation: string;
  experience: string;
  subjects: string[];
  createdAt: string;
  reviewNote?: string;
}

const statusConfig: Record<AppStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  PENDING:  { label: 'Under Review', icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  APPROVED: { label: 'Approved!',    icon: '🎉', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  REJECTED: { label: 'Not Approved', icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'  },
};

export default function ApplyModerator() {
  const navigate = useNavigate();
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingApp, setExistingApp] = useState<ExistingApp | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    apiFetch('/moderator-applications/me')
      .then((data: any) => setExistingApp(data))
      .catch(() => {}) // 404 = no application yet, that's fine
      .finally(() => setCheckingStatus(false));
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject area.');
      return;
    }
    if (motivation.trim().length < 80) {
      setError('Please write a more detailed motivation (at least 80 characters).');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/moderator-applications', {
        method: 'POST',
        body: JSON.stringify({ motivation: motivation.trim(), experience: experience.trim(), subjects: selectedSubjects }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Checking application status...</span>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={{ maxWidth: 540, margin: '3rem auto', textAlign: 'center' }} className="animate-fade-in">
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🎉</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Thank you for applying to become a CuriousBright moderator. Our admin team will review
            your application and you'll receive a notification with the decision.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/browse" className="btn btn-primary">Browse Library</Link>
            <Link to="/community" className="btn btn-secondary">Study Rooms</Link>
          </div>
        </div>
      </div>
    );
  }

  // Existing application status view
  if (existingApp) {
    const cfg = statusConfig[existingApp.status];
    return (
      <div style={{ maxWidth: 620, margin: '2rem auto' }} className="animate-fade-in">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/browse" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to Library</Link>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Moderator Application</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          You have already submitted an application.
        </p>

        {/* Status card */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ fontSize: '2rem' }}>{cfg.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: cfg.color, marginBottom: '0.2rem' }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Submitted {new Date(existingApp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {existingApp.reviewNote && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>📝 Admin note: {existingApp.reviewNote}</span>
          </div>
        )}

        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Your Motivation</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{existingApp.motivation}</p>
        </div>

        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Experience & Background</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{existingApp.experience}</p>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Subject Areas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {existingApp.subjects.map(s => (
              <span key={s} className="badge badge-level">{s}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: '3rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/browse" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to Library</Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>Apply as Moderator</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Help keep CuriousBright a high-quality academic space
            </p>
          </div>
        </div>
      </div>

      {/* What moderators do */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          What moderators do
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { icon: '📋', text: 'Review submitted papers for quality' },
            { icon: '✅', text: 'Approve or reject submissions' },
            { icon: '🚩', text: 'Handle community reports' },
            { icon: '🤝', text: 'Uphold platform standards' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} id="moderator-apply-form">

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Motivation */}
        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="motivation">
              Why do you want to be a moderator? *
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', marginTop: '0.2rem' }}>
              Tell us your motivation and what makes you a good fit for this role.
            </p>
            <textarea
              id="motivation"
              rows={5}
              placeholder="I want to contribute to CuriousBright because..."
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              required
              minLength={80}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: motivation.length < 80 ? 'var(--text-muted)' : 'var(--success)', marginTop: '0.3rem' }}>
              {motivation.length}/80 min chars
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="experience">
              Academic background & relevant experience
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', marginTop: '0.2rem' }}>
              Describe your academic background, any reviewing or editing experience, or relevant expertise.
            </p>
            <textarea
              id="experience"
              rows={4}
              placeholder="I hold a degree in... / I have experience reviewing... / I have been using the platform since..."
              value={experience}
              onChange={e => setExperience(e.target.value)}
            />
          </div>
        </div>

        {/* Subjects */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>
            Subject areas you can evaluate *
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Select all areas where you have sufficient knowledge to review academic content.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SUBJECT_OPTIONS.map(subject => {
              const selected = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  id={`subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    border: selected ? '1px solid rgba(99,102,241,0.6)' : '1px solid var(--glass-border)',
                    background: selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: selected ? '#a5b4fc' : 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                    fontWeight: selected ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selected && '✓ '}{subject}
                </button>
              );
            })}
          </div>
          {selectedSubjects.length > 0 && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
              {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <button
          id="apply-moderator-submit"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} /> Submitting...</>
          ) : (
            '🛡️ Submit Moderator Application'
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Applications are reviewed by our admin team within 3–5 business days.
        </p>
      </form>
    </div>
  );
}
