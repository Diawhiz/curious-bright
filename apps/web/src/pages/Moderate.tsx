import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface Submission {
  id: string;
  title: string;
  description: string;
  fileKey: string;
  authorId: string;
  status: string;
  academicLevel?: string;
}

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reporter: { name: string; email: string };
  reason: string;
  status: string;
  createdAt: string;
}

export default function Moderate() {
  const [activeTab, setActiveTab] = useState<'SUBMISSIONS' | 'REPORTS' | 'ANALYTICS'>('SUBMISSIONS');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    try {
      const data = await apiFetch('/submissions?status=PENDING');
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.message === 'Forbidden' || err.message.includes('403') || err.message === 'Unauthorized' || err.message.includes('401')) {
        setIsForbidden(true);
      } else {
        setError(err.message || 'Failed to fetch pending submissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await apiFetch('/reports');
      if (Array.isArray(data)) {
        setReports(data.filter((r: any) => r.status === 'PENDING'));
      }
    } catch (err: any) {
      if (err.message === 'Forbidden' || err.message.includes('403') || err.message === 'Unauthorized' || err.message.includes('401')) {
        setIsForbidden(true);
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiFetch('/analytics/dashboard');
      setAnalytics(data);
    } catch (err: any) {
      if (err.message === 'Forbidden' || err.message.includes('403') || err.message === 'Unauthorized' || err.message.includes('401')) {
        setIsForbidden(true);
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchReports();
    fetchAnalytics();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to update submission status');
    }
  };

  const handleResolveReport = async (id: string, status: 'RESOLVED') => {
    try {
      await apiFetch(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  if (isForbidden) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '540px', margin: '3rem auto' }}>
        <div className="glass-card text-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h3>Moderator & Admin Access Required</h3>
          <p className="text-secondary text-sm mt-2 mb-6">
            The moderation dashboard, report resolution queue, and platform analytics are restricted to verified MODERATOR and ADMIN accounts.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary">
              Log in as Moderator →
            </Link>
            <Link to="/browse" className="btn btn-secondary">
              Browse Open Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Moderation Dashboard</h2>
          <p className="text-muted text-sm mt-2">Review submissions, resolve safety reports, and track platform metrics</p>
        </div>

        <div className="flex gap-2" style={{ background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <button 
            className={`btn ${activeTab === 'SUBMISSIONS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
            onClick={() => setActiveTab('SUBMISSIONS')}
          >
            📋 Submissions ({submissions.length})
          </button>
          <button 
            className={`btn ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
            onClick={() => setActiveTab('REPORTS')}
          >
            🛡️ Safety Reports ({reports.length})
          </button>
          <button 
            className={`btn ${activeTab === 'ANALYTICS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', border: 'none' }}
            onClick={() => setActiveTab('ANALYTICS')}
          >
            📊 Analytics
          </button>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading moderation queues...</p>
        </div>
      ) : (
        <>
          {/* SUBMISSIONS TAB */}
          {activeTab === 'SUBMISSIONS' && (
            submissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">Submissions Queue Clear</div>
                <div className="empty-state-desc">There are currently no pending research paper submissions awaiting moderation.</div>
              </div>
            ) : (
              <div className="grid-container">
                {submissions.map(sub => (
                  <div key={sub.id} className="glass-card flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge badge-pending">Pending Review</span>
                        {sub.academicLevel && (
                          <span className="badge badge-level">{sub.academicLevel.replace('_', ' ')}</span>
                        )}
                      </div>
                      <h3 className="mb-2" style={{ fontSize: '1.125rem' }}>{sub.title}</h3>
                      <p className="text-secondary text-sm mb-4">{sub.description}</p>
                    </div>

                    <div className="flex justify-between items-center gap-3 pt-4 mt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <button 
                        className="btn btn-success" 
                        onClick={() => handleStatusUpdate(sub.id, 'APPROVED')}
                        style={{ flex: 1, padding: '0.5rem' }}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleStatusUpdate(sub.id, 'REJECTED')}
                        style={{ flex: 1, padding: '0.5rem' }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* REPORTS TAB */}
          {activeTab === 'REPORTS' && (
            reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛡️</div>
                <div className="empty-state-title">Safety Queue Clear</div>
                <div className="empty-state-desc">There are currently no open safety reports or content flags from members.</div>
              </div>
            ) : (
              <div className="grid-container">
                {reports.map(rep => (
                  <div key={rep.id} className="glass-card flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge badge-pending">{rep.targetType} Report</span>
                        <span className="text-xs text-muted">ID: {rep.targetId.slice(0, 8)}...</span>
                      </div>
                      <p className="text-sm font-medium mb-2">Reason: "{rep.reason}"</p>
                      <p className="text-xs text-muted mb-4">
                        Filed by: {rep.reporter?.name || 'Anonymous'} ({rep.reporter?.email || 'N/A'})
                      </p>
                    </div>

                    <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <button 
                        className="btn btn-success" 
                        onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                        style={{ width: '100%', padding: '0.5rem' }}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'ANALYTICS' && (
            !analytics ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">Analytics Data Unavailable</div>
                <div className="empty-state-desc">Failed to fetch platform metrics from the analytics backend service.</div>
              </div>
            ) : (
              <div className="grid-container">
                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Total Members</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.5rem' }}>
                    {analytics.totalUsers ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Total Submissions</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    {analytics.totalSubmissions ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Pending Submissions</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.5rem' }}>
                    {analytics.pendingSubmissions ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Study Rooms</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.5rem' }}>
                    {analytics.totalRooms ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Active Rooms</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>
                    {analytics.activeRooms ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Total Messages</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    {analytics.totalMessages ?? 0}
                  </div>
                </div>

                <div className="glass-card text-center">
                  <span className="text-xs text-muted uppercase">Open Reports</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.5rem' }}>
                    {analytics.pendingReports ?? 0}
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
