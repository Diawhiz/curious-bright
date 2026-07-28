import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any>({ submissions: [], rooms: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (q) {
      setLoading(true);
      setError('');
      apiFetch(`/search?q=${encodeURIComponent(q)}`)
        .then(data => setResults(data || { submissions: [], rooms: [], users: [] }))
        .catch(err => {
          console.error('Search error:', err);
          setError('Search query failed or backend search engine is initializing');
        })
        .finally(() => setLoading(false));
    }
  }, [q]);

  if (!q) {
    return (
      <div className="empty-state animate-fade-in" style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Global Repository Search</div>
        <div className="empty-state-desc">
          Enter a search query in the top navigation bar to find research papers, study rooms, or users.
        </div>
      </div>
    );
  }

  const hasSubmissions = results.submissions && results.submissions.length > 0;
  const hasRooms = results.rooms && results.rooms.length > 0;
  const hasUsers = results.users && results.users.length > 0;
  const totalResults = (results.submissions?.length || 0) + (results.rooms?.length || 0) + (results.users?.length || 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2>Search Results</h2>
        <p className="text-muted text-sm mt-2">
          Found <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> results matching "{q}"
        </p>
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
          <p>Searching repository and community database...</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No Results Found for "{q}"</div>
          <div className="empty-state-desc">
            Try checking for spelling errors or searching for broader academic terms.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Submissions Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '1.125rem' }}>
              📚 Research Papers ({results.submissions?.length || 0})
            </h3>
            {hasSubmissions ? (
              <div className="grid-container">
                {results.submissions.map((sub: any) => (
                  <div key={sub.id} className="glass-card flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge badge-approved">Approved</span>
                        {sub.academicLevel && (
                          <span className="badge badge-level">{sub.academicLevel.replace('_', ' ')}</span>
                        )}
                      </div>
                      <h4 className="mb-2" style={{ fontSize: '1rem' }}>{sub.title}</h4>
                      <p className="text-secondary text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sub.description}
                      </p>
                    </div>
                    <Link to={`/read/${sub.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                      Read Paper →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No research papers found for this query.</p>
            )}
          </section>

          {/* Rooms Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '1.125rem' }}>
              💬 Study Rooms ({results.rooms?.length || 0})
            </h3>
            {hasRooms ? (
              <div className="grid-container">
                {results.rooms.map((room: any) => (
                  <div key={room.id} className="glass-card flex flex-col justify-between">
                    <div>
                      <span className="badge badge-level mb-2">{room.topic || 'General'}</span>
                      <h4 className="mb-2" style={{ fontSize: '1rem' }}>{room.name}</h4>
                    </div>
                    <Link to={`/room/${room.id}`} className="btn btn-secondary mt-4" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                      Join Room →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No study rooms found for this query.</p>
            )}
          </section>

          {/* Users Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '1.125rem' }}>
              👥 Members & Scholars ({results.users?.length || 0})
            </h3>
            {hasUsers ? (
              <div className="grid-container">
                {results.users.map((user: any) => (
                  <div key={user.id} className="glass-card flex items-center justify-between" style={{ padding: '1rem 1.25rem' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-muted">{user.schoolName || 'Independent Learner'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No users found for this query.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
