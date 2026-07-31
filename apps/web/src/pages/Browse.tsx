import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';
import { CuriousLoading, CuriousEmpty } from '../components/CuriousStates';

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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>
            <HighlighterText color="#F4B43D">Open Academic Repository</HighlighterText>
          </h2>
          <p className="text-muted text-sm mt-2">
            Explore public domain classics, open-access textbooks, and community-written papers with co-authors.
          </p>
        </div>

        {/* Tab Switcher with Boxicons */}
        <div className="flex gap-2" style={{ background: 'var(--color-paper-card)', padding: '0.3rem', borderRadius: '4px 0px 4px 4px', border: '1.5px solid var(--color-line)' }}>
          <button 
            className={`btn ${activeCatalog === 'BOOKS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveCatalog('BOOKS')}
          >
            <i className="bx bx-book-alt" style={{ fontSize: '1rem' }}></i>
            <span>Open Classics ({books.length})</span>
          </button>
          <button 
            className={`btn ${activeCatalog === 'COMMUNITY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.8125rem' }}
            onClick={() => setActiveCatalog('COMMUNITY')}
          >
            <i className="bx bx-file" style={{ fontSize: '1rem' }}></i>
            <span>Shared Papers ({submissions.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="comment-corner-card mb-6" style={{ padding: '1.25rem' }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex-1" style={{ minWidth: '220px' }}>
            <input 
              type="text" 
              placeholder={activeCatalog === 'BOOKS' ? "Search books by title, author, topic..." : "Search shared papers..."}
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
                  {level === 'ALL' ? 'All Learning Levels' : level.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Catalog Views */}
      {loading ? (
        <CuriousLoading message="Opening library catalog & preparing books..." />
      ) : activeCatalog === 'BOOKS' ? (
        /* OPEN SOURCE BOOKS CATALOG */
        filteredBooks.length === 0 ? (
          <CuriousEmpty
            title="No Books Match Your Search"
            description="Nothing matched your current query or filters. Try adjusting your search term."
            flourishText="Open Library"
            actionButton={
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedLevel('ALL'); }}>
                Reset Search Filters
              </button>
            }
          />
        ) : (
          <div className="grid-container">
            {filteredBooks.map(book => (
              <CommentCornerCard
                key={book.id}
                commentPreview={`Note: ${book.title.slice(0, 32)}... Peel corner to view margin notes.`}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge-tag badge-mustard">
                      {book.license || 'Public Domain'}
                    </span>
                    <span className="badge-tag badge-teal">
                      {book.academicLevel?.replace('_', ' ') || 'HIGH SCHOOL+'}
                    </span>
                  </div>

                  <h3 className="mb-2" style={{ fontSize: '1.15rem', lineHeight: '1.35' }}>
                    {book.title}
                  </h3>

                  <p className="text-xs text-muted mb-3 flex items-center gap-1" style={{ fontWeight: 600 }}>
                    <i className="bx bx-pen" style={{ fontSize: '0.9rem' }}></i>
                    {book.author || 'Classical Author'} • Source: {book.source}
                  </p>

                  <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.description}
                  </p>

                  {book.subjectTags && book.subjectTags.length > 0 && (
                    <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {book.subjectTags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge-tag" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4" style={{ borderTop: '1.5px solid var(--color-line)', marginTop: '1rem' }}>
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <i className="bx bx-bolt-circle" style={{ fontSize: '0.9rem', color: 'var(--color-mustard)' }}></i>
                    {book.cacheStatus === 'CACHED' ? 'Ready to read instantly' : 'Open document'}
                  </span>
                  <button 
                    onClick={() => handleReadBook(book)}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}
                  >
                    <span>Read Book</span>
                    <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
                  </button>
                </div>
              </CommentCornerCard>
            ))}
          </div>
        )
      ) : (
        /* SHARED PAPERS CATALOG */
        filteredSubmissions.length === 0 ? (
          <CuriousEmpty
            title="No Shared Papers Found"
            description="Be the first co-author to publish a paper to the community notebook!"
            flourishText="Community Notebook"
            actionButton={
              <Link to="/submit" className="btn btn-primary">
                <span>Share a Paper</span>
                <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
              </Link>
            }
          />
        ) : (
          <div className="grid-container">
            {filteredSubmissions.map(sub => (
              <CommentCornerCard
                key={sub.id}
                commentPreview="Peer review note: Verified by community co-authors."
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge-tag badge-teal">Verified Paper</span>
                    {sub.academicLevel && (
                      <span className="badge-tag badge-mustard">
                        {sub.academicLevel.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2" style={{ fontSize: '1.15rem', lineHeight: '1.35' }}>
                    {sub.title}
                  </h3>

                  {sub.user && (
                    <p className="text-xs text-muted mb-3 flex items-center gap-1" style={{ fontWeight: 600 }}>
                      <i className="bx bx-pen" style={{ fontSize: '0.9rem' }}></i>
                      {sub.user.name} {sub.user.schoolName ? `• ${sub.user.schoolName}` : ''}
                    </p>
                  )}

                  <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {sub.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4" style={{ borderTop: '1.5px solid var(--color-line)', marginTop: '1rem' }}>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <i className="bx bx-file-pdf" style={{ fontSize: '0.9rem' }}></i>
                    Shared PDF
                  </span>
                  <Link to={`/read/${sub.id}`} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem' }}>
                    <span>Read Paper</span>
                    <i className="bx bx-right-arrow-alt" style={{ fontSize: '1.1rem' }}></i>
                  </Link>
                </div>
              </CommentCornerCard>
            ))}
          </div>
        )
      )}
    </div>
  );
}
