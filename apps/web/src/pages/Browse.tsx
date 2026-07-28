import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface BookItem {
  id: string;
  source: string;
  sourceId: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  license: string;
  academicLevel: string;
  subjectTags: string[];
  cachedFileUrl?: string;
  cacheStatus: string;
  originUrl?: string;
}

interface SubmissionItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  academicLevel?: string;
  status: string;
  license?: string;
  user?: { name: string; schoolName?: string };
}

const ACADEMIC_LEVELS = [
  'ALL',
  'HIGH_SCHOOL',
  'COLLEGE',
  'GRADUATE',
  'PROFESSIONAL',
];

export default function Browse() {
  const navigate = useNavigate();
  const [activeCatalog, setActiveCatalog] = useState<'BOOKS' | 'COMMUNITY'>('BOOKS');
  const [books, setBooks] = useState<BookItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCatalog();
  }, [activeCatalog, selectedLevel]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      if (activeCatalog === 'BOOKS') {
        const levelQuery = selectedLevel !== 'ALL' ? `?academicLevel=${selectedLevel}` : '';
        const data = await apiFetch(`/books${levelQuery}`);
        setBooks(Array.isArray(data) ? data : []);
      } else {
        const data = await apiFetch('/submissions?status=APPROVED');
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadBook = async (book: BookItem) => {
    // Navigate to /read/:id which will hit /books/:id/read to trigger R2 caching
    navigate(`/read/${book.id}`, {
      state: {
        title: book.title,
        description: book.description,
        academicLevel: book.academicLevel,
        license: book.license,
      }
    });
  };

  const filteredBooks = books.filter(b => 
    !searchTerm || 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(sub => {
    const matchesLevel = selectedLevel === 'ALL' || sub.academicLevel === selectedLevel;
    const matchesSearch = !searchTerm || 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Open Academic Repository</h2>
          <p className="text-muted text-sm mt-2">
            Explore public domain classics, open-access textbooks, and peer-reviewed community papers (HIGH_SCHOOL+)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2" style={{ background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <button 
            className={`btn ${activeCatalog === 'BOOKS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem', border: 'none' }}
            onClick={() => setActiveCatalog('BOOKS')}
          >
            📖 Open-Source Books ({books.length})
          </button>
          <button 
            className={`btn ${activeCatalog === 'COMMUNITY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem', border: 'none' }}
            onClick={() => setActiveCatalog('COMMUNITY')}
          >
            📝 Community Papers ({submissions.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-card mb-6" style={{ padding: '1.25rem' }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex-1" style={{ minWidth: '220px' }}>
            <input 
              type="text" 
              placeholder={activeCatalog === 'BOOKS' ? "Search books by title, author, subject..." : "Search community papers..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select 
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
            >
              {ACADEMIC_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level === 'ALL' ? 'All Academic Levels' : level.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading open catalog & verifying cache layers...</p>
        </div>
      ) : activeCatalog === 'BOOKS' ? (
        /* OPEN SOURCE BOOKS CATALOG */
        filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📖</div>
            <div className="empty-state-title">No Books Found</div>
            <div className="empty-state-desc">
              No open-source books matched your criteria. Try resetting search filters.
            </div>
            <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedLevel('ALL'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-container">
            {filteredBooks.map(book => (
              <div key={book.id} className="glass-card glass-card-interactive flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-public-domain">
                      {book.license || 'Public Domain'}
                    </span>
                    <span className="badge badge-level">
                      {book.academicLevel?.replace('_', ' ') || 'HIGH SCHOOL+'}
                    </span>
                  </div>

                  <h3 className="mb-2" style={{ fontSize: '1.125rem', lineHeight: '1.4' }}>
                    {book.title}
                  </h3>

                  <p className="text-xs text-muted mb-3" style={{ fontWeight: 500 }}>
                    ✍️ {book.author || 'Unknown Author'} • Source: {book.source}
                  </p>

                  <p className="text-secondary text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.description}
                  </p>

                  {book.subjectTags && book.subjectTags.length > 0 && (
                    <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {book.subjectTags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: 4, color: 'var(--text-muted)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1rem' }}>
                  <span className="text-xs text-muted">
                    {book.cacheStatus === 'CACHED' ? '⚡ Edge Cached' : '🌐 Origin Document'}
                  </span>
                  <button 
                    onClick={() => handleReadBook(book)}
                    className="btn btn-primary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}
                  >
                    Read Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* COMMUNITY PAPERS CATALOG */
        filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No Community Submissions Found</div>
            <div className="empty-state-desc">
              Be the first scholar to submit a research paper to the community repository!
            </div>
            <Link to="/submit" className="btn btn-primary">
              Submit a Research Paper
            </Link>
          </div>
        ) : (
          <div className="grid-container">
            {filteredSubmissions.map(sub => (
              <div key={sub.id} className="glass-card glass-card-interactive flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-approved">Approved</span>
                    {sub.academicLevel && (
                      <span className="badge badge-level">
                        {sub.academicLevel.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2" style={{ fontSize: '1.125rem', lineHeight: '1.4' }}>
                    {sub.title}
                  </h3>

                  {sub.user && (
                    <p className="text-xs text-muted mb-3" style={{ fontWeight: 500 }}>
                      ✍️ {sub.user.name} {sub.user.schoolName ? `• ${sub.user.schoolName}` : ''}
                    </p>
                  )}

                  <p className="text-secondary text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {sub.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1rem' }}>
                  <span className="text-xs text-muted">Community PDF</span>
                  <Link to={`/read/${sub.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                    Read Paper →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
