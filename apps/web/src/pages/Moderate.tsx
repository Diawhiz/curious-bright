import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty } from '../components/CuriousStates';

interface Submission {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  academicLevel?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    schoolName?: string;
  };
}

interface SafetyLog {
  id: string;
  flagType: string;
  reason: string;
  createdAt: string;
  user?: { name: string };
  targetMessage?: { content: string };
}

export default function Moderate() {
  const [activeTab, setActiveTab] = useState<'SUBMISSIONS' | 'SAFETY' | 'OVERVIEW'>('SUBMISSIONS');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [safetyLogs, setSafetyLogs] = useState<SafetyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchQueue();
  }, [activeTab]);

  const fetchQueue = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      if (activeTab === 'SUBMISSIONS') {
        const data = await apiFetch('/submissions?status=PENDING');
        setSubmissions(Array.isArray(data) ? data : []);
      } else if (activeTab === 'SAFETY') {
        const data = await apiFetch('/moderation/flags');
        setSafetyLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Moderation fetch warning:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (id: string) => {
    try {
      await apiFetch(`/submissions/${id}/approve`, { method: 'POST' });
      setActionMessage('Paper approved and published to Open Library');
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      setActionMessage('Could not approve submission at this time.');
    }
  };

  const handleRejectSubmission = async (id: string) => {
    try {
      await apiFetch(`/submissions/${id}/reject`, { method: 'POST' });
      setActionMessage('Paper returned to author with feedback');
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      setActionMessage('Could not reject submission at this time.');
    }
  };

  return (
    <div>
      {/* Header with Boxicons */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>
            <HighlighterText color="#00A896">Community Peer Review</HighlighterText>
          </h2>
          <p className="text-muted text-sm mt-2">
            Review community-submitted papers, ensure open-access standards, and maintain safety across study rooms.
          </p>
        </div>

        {/* Tab Switcher with Boxicons */}
        <div className="flex gap-2" style={{ background: 'var(--color-paper-card)', padding: '0.3rem', borderRadius: '4px 0px 4px 4px', border: '1.5px solid var(--color-line)' }}>
          <button
            className={`btn ${activeTab === 'SUBMISSIONS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('SUBMISSIONS')}
          >
            <i className="bx bx-file" style={{ fontSize: '1rem' }}></i>
            <span>Pending Papers ({submissions.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'SAFETY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('SAFETY')}
          >
            <i className="bx bx-shield" style={{ fontSize: '1rem' }}></i>
            <span>Safety Concerns ({safetyLogs.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <i className="bx bx-bar-chart-alt-2" style={{ fontSize: '1rem' }}></i>
            <span>Notebook Overview</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-info mb-6">
          <span className="flex items-center gap-1.5">
            <i className="bx bx-check-circle" style={{ fontSize: '1.1rem' }}></i>
            {actionMessage}
          </span>
        </div>
      )}

      {loading ? (
        <CuriousLoading message="Fetching peer review queue..." />
      ) : activeTab === 'SUBMISSIONS' ? (
        submissions.length === 0 ? (
          <CuriousEmpty
            title="Review Queue is Clean"
            description="There are currently no pending paper submissions waiting for review."
            flourishText="Peer Review Queue"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {submissions.map(sub => (
              <CommentCornerCard key={sub.id} commentPreview="Reviewer checklist: Verify open license & plain abstract">
                <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge-tag badge-mustard">
                        {sub.academicLevel ? sub.academicLevel.replace('_', ' ') : 'General Academic'}
                      </span>
                      <span className="badge-tag badge-teal">
                        Author: {sub.user?.name} {sub.user?.schoolName ? `(${sub.user.schoolName})` : ''}
                      </span>
                    </div>

                    <h3 className="mb-2" style={{ fontSize: '1.2rem' }}>{sub.title}</h3>
                    <p className="text-muted text-sm mb-4">{sub.description}</p>

                    <div className="flex items-center gap-3">
                      <a 
                        href={sub.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <i className="bx bx-file-pdf" style={{ fontSize: '0.95rem' }}></i>
                        <span>Inspect PDF Document</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRejectSubmission(sub.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 0.95rem', fontSize: '0.8125rem', borderColor: 'var(--color-coral)' }}
                    >
                      <i className="bx bx-x" style={{ fontSize: '1.1rem', color: 'var(--color-coral)' }}></i>
                      <span>Return to Author</span>
                    </button>
                    <button 
                      onClick={() => handleApproveSubmission(sub.id)}
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 0.95rem', fontSize: '0.8125rem' }}
                    >
                      <i className="bx bx-check" style={{ fontSize: '1.1rem' }}></i>
                      <span>Publish Paper</span>
                    </button>
                  </div>
                </div>
              </CommentCornerCard>
            ))}
          </div>
        )
      ) : activeTab === 'SAFETY' ? (
        safetyLogs.length === 0 ? (
          <CuriousEmpty
            title="No Safety Concerns Flagged"
            description="All study rooms and co-author discussions are running safely."
            flourishText="Safety & Integrity"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {safetyLogs.map(log => (
              <CommentCornerCard key={log.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge-tag badge-coral">{log.flagType || 'Content Flag'}</span>
                  <span className="text-xs text-muted">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-semibold text-sm mb-1">{log.reason}</p>
                {log.targetMessage && (
                  <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-paper)', border: '1.5px solid var(--color-line)', borderRadius: '4px 0px 4px 4px', fontSize: '0.8125rem' }}>
                    "{log.targetMessage.content}"
                  </div>
                )}
              </CommentCornerCard>
            ))}
          </div>
        )
      ) : (
        <CommentCornerCard style={{ padding: '2rem' }}>
          <h3 className="mb-2" style={{ fontSize: '1.25rem' }}>Notebook Health & Guidelines</h3>
          <p className="text-muted text-sm mb-4">
            Curious Bright enforces open access, non-discriminatory collaboration, and plain-language communication across all shared spaces.
          </p>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, padding: '1rem', background: 'var(--color-paper)', border: '1.5px solid var(--color-line)', borderRadius: '4px 0px 4px 4px' }}>
              <h4 className="mb-1 text-sm font-semibold flex items-center gap-1">
                <i className="bx bx-check-shield" style={{ fontSize: '1rem', color: 'var(--color-teal)' }}></i>
                Plain Language Standard
              </h4>
              <p className="text-xs text-muted">No obscure technical jargon. Keep descriptions accessible to all learning levels.</p>
            </div>
            <div style={{ flex: 1, padding: '1rem', background: 'var(--color-paper)', border: '1.5px solid var(--color-line)', borderRadius: '4px 0px 4px 4px' }}>
              <h4 className="mb-1 text-sm font-semibold flex items-center gap-1">
                <i className="bx bx-user-check" style={{ fontSize: '1rem', color: 'var(--color-coral)' }}></i>
                Collaborator Respect
              </h4>
              <p className="text-xs text-muted">Zero status dots or competitive metrics. Everyone participates on equal standing.</p>
            </div>
          </div>
        </CommentCornerCard>
      )}
    </div>
  );
}
