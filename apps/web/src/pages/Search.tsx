import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty } from '../components/CuriousStates';

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
          setError('Could not complete your search query at this time.');
        })
        .finally(() => setLoading(false));
    }
  }, [q]);

  if (!q) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <CuriousEmpty
          title="Search the Library"
          description="Type a search query in the search bar above to find books, study rooms, or co-authors."
          flourishText="Global Search"
        />
      </div>
    );
  }

  const hasSubmissions = results.submissions && results.submissions.length > 0;
  const hasRooms = results.rooms && results.rooms.length > 0;
  const hasUsers = results.users && results.users.length > 0;
  const totalResults = (results.submissions?.length || 0) + (results.rooms?.length || 0) + (results.users?.length || 0);

  return (
    <div>
      <div className="mb-6">
        <h2>
          <HighlighterText color="#F4B43D">Search Results</HighlighterText>
        </h2>
        <p className="text-muted text-sm mt-2">
          Found <strong style={{ color: 'var(--color-ink)' }}>{totalResults}</strong> items matching "{q}"
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{'\u26A1 '} {error}</span>
        </div>
      )}

      {loading ? (
        <CuriousLoading message={`Searching library and study rooms for "${q}"...`} />
      ) : totalResults === 0 ? (
        <CuriousEmpty
          title={`No Items Found for "${q}"`}
          description="Try checking for spelling errors or searching for broader terms."
          flourishText="Search Results"
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Submissions Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1.5px solid var(--color-line)', fontSize: '1.15rem' }}>
              {'\uD83D\uDCD6 Shared Papers'} ({results.submissions?.length || 0})
            </h3>
            {hasSubmissions ? (
              <div className="grid-container">
                {results.submissions.map((sub: any) => (
                  <CommentCornerCard key={sub.id} className="flex flex-col justify-between" commentPreview="Peel corner to view summary">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge-tag badge-teal">Verified Paper</span>
                        {sub.academicLevel && (
                          <span className="badge-tag badge-mustard">{sub.academicLevel.replace('_', ' ')}</span>
                        )}
                      </div>
                      <h4 className="mb-2" style={{ fontSize: '1.05rem' }}>{sub.title}</h4>
                      <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sub.description}
                      </p>
                    </div>
                    <Link to={`/read/${sub.id}`} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}>
                      {'Read Paper \u2192'}
                    </Link>
                  </CommentCornerCard>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No papers found matching this query.</p>
            )}
          </section>

          {/* Rooms Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1.5px solid var(--color-line)', fontSize: '1.15rem' }}>
              {'\uD83D\uDCAC Study Rooms'} ({results.rooms?.length || 0})
            </h3>
            {hasRooms ? (
              <div className="grid-container">
                {results.rooms.map((room: any) => (
                  <CommentCornerCard key={room.id} className="flex flex-col justify-between" commentPreview="Peel corner to view room rules">
                    <div>
                      <span className="badge-tag badge-mustard mb-2">{room.topic || 'General Topic'}</span>
                      <h4 className="mb-2" style={{ fontSize: '1.05rem' }}>{room.name}</h4>
                    </div>
                    <Link to={`/room/${room.id}`} className="btn btn-secondary mt-4" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}>
                      {'Join Room \u2192'}
                    </Link>
                  </CommentCornerCard>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No study rooms found matching this query.</p>
            )}
          </section>

          {/* Users Section */}
          <section>
            <h3 className="mb-4 pb-2" style={{ borderBottom: '1.5px solid var(--color-line)', fontSize: '1.15rem' }}>
              {'\uD83D\uDC65 Co-authors & Scholars'} ({results.users?.length || 0})
            </h3>
            {hasUsers ? (
              <div className="grid-container">
                {results.users.map((user: any) => (
                  <CommentCornerCard key={user.id} className="flex items-center justify-between" style={{ padding: '1rem 1.25rem' }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '3px 0px 3px 3px',
                          background: 'var(--color-coral)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-muted">{user.schoolName || 'Co-author'}</div>
                      </div>
                    </div>
                  </CommentCornerCard>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No co-authors found matching this query.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
