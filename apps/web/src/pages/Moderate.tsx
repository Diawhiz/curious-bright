import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty } from '../components/CuriousStates';

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
        setError(err.message || 'Failed to fetch pending paper reviews');
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
      alert(err.message || 'Failed to update paper status');
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
      <div style={{ maxWidth: '540px', margin: '3rem auto' }}>
        <CommentCornerCard className="text-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h3>Review Queue Access</h3>
          <p className="text-muted text-sm mt-2 mb-6">
            Community moderation, paper reviews, and safety oversight are reserved for verified co-author accounts.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary">
              Sign In as Co-author →
            </Link>
            <Link to="/browse" className="btn btn-secondary">
              Browse Open Library
            </Link>
          </div>
        </CommentCornerCard>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>
            <HighlighterText color="#00A896">Community Review Queue</HighlighterText>
          </h2>
          <p className="text-muted text-sm mt-2">Review shared papers, resolve community flags, and track reader activity</p>
        </div>

        <div className="flex gap-2" style={{ background: 'var(--color-paper-card)', padding: '0.3rem', borderRadius: '4px 0px 4px 4px', border: '1.5px solid var(--color-line)' }}>
          <button 
            className={`btn ${activeTab === 'SUBMISSIONS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('SUBMISSIONS')}
          >
            📋 Pending Papers ({submissions.length})
          </button>
          <button 
            className={`btn ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('REPORTS')}
          >
            🛡️ Safety Concerns ({reports.length})
          </button>
          <button 
            className={`btn ${activeTab === 'ANALYTICS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('ANALYTICS')}
          >
            📊 Notebook Overview
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <CuriousLoading message="Opening review queue..." />
      ) : (
        <>
          {/* SUBMISSIONS TAB */}
          {activeTab === 'SUBMISSIONS' && (
            submissions.length === 0 ? (
              <CuriousEmpty
                title="Paper Queue Clear"
                description="There are currently no pending research papers awaiting review."
                flourishText="Review Queue"
              />
            ) : (
              <div className="grid-container">
                {submissions.map(sub => (
                  <CommentCornerCard key={sub.id} className="flex flex-col justify-between" commentPreview="Peel corner to inspect submitter history">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge-tag badge-mustard">Awaiting Review</span>
                        {sub.academicLevel && (
                          <span className="badge-tag badge-teal">{sub.academicLevel.replace('_', ' ')}</span>
                        )}
                      </div>
                      <h3 className="mb-2" style={{ fontSize: '1.15rem' }}>{sub.title}</h3>
                      <p className="text-muted text-sm mb-4">{sub.description}</p>
                    </div>

                    <div className="flex justify-between items-center gap-3 pt-4 mt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleStatusUpdate(sub.id, 'APPROVED')}
                        style={{ flex: 1, padding: '0.5rem', background: '#00A896', borderColor: '#00A896' }}
                      >
                        ✓ Publish Paper
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleStatusUpdate(sub.id, 'REJECTED')}
                        style={{ flex: 1, padding: '0.5rem', color: '#FF5A36', borderColor: '#FF5A36' }}
                      >
                        Return Paper
                      </button>
                    </div>
                  </CommentCornerCard>
                ))}
              </div>
            )
          )}

          {/* REPORTS TAB */}
          {activeTab === 'REPORTS' && (
            reports.length === 0 ? (
              <CuriousEmpty
                title="Safety Queue Clear"
                description="There are no open safety concerns or flagged content items."
                flourishText="Safety Oversight"
              />
            ) : (
              <div className="grid-container">
                {reports.map(rep => (
                  <CommentCornerCard key={rep.id} className="flex flex-col justify-between" commentPreview="Peel corner for reporter details">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge-tag badge-coral">{rep.targetType} Concern</span>
                      </div>
                      <p className="text-sm font-semibold mb-2">Reason: "{rep.reason}"</p>
                      <p className="text-xs text-muted mb-4">
                        Shared by: {rep.reporter?.name || 'Member'} ({rep.reporter?.email || 'N/A'})
                      </p>
                    </div>

                    <div className="pt-4 mt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                        style={{ width: '100%', padding: '0.5rem' }}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </CommentCornerCard>
                ))}
              </div>
            )
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'ANALYTICS' && (
            !analytics ? (
              <CuriousEmpty
                title="Overview Unavailable"
                description="Could not load platform metrics from the overview service."
                flourishText="Notebook Analytics"
              />
            ) : (
              <div className="grid-container">
                <CommentCornerCard className="text-center">
                  <span className="text-xs text-muted font-semibold uppercase">Co-authors & Members</span>
                  <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-coral)', marginTop: '0.4rem' }}>
                    {analytics.totalUsers ?? 0}
                  </div>
                </CommentCornerCard>

                <CommentCornerCard className="text-center">
                  <span className="text-xs text-muted font-semibold uppercase">Published Papers</span>
                  <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.4rem' }}>
                    {analytics.totalSubmissions ?? 0}
                  </div>
                </CommentCornerCard>

                <CommentCornerCard className="text-center">
                  <span className="text-xs text-muted font-semibold uppercase">Pending Papers</span>
                  <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-mustard)', marginTop: '0.4rem' }}>
                    {analytics.pendingSubmissions ?? 0}
                  </div>
                </CommentCornerCard>

                <CommentCornerCard className="text-center">
                  <span className="text-xs text-muted font-semibold uppercase">Active Study Rooms</span>
                  <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-teal)', marginTop: '0.4rem' }}>
                    {analytics.totalRooms ?? 0}
                  </div>
                </CommentCornerCard>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
