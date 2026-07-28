import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { apiFetch } from '../lib/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure CDN worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  academicLevel?: string;
  license?: string;
  cached?: boolean;
}

export default function Read() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [docItem, setDocItem] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError('');

      // Check state passed from navigation
      const navState = location.state as { fileUrl?: string; title?: string; description?: string; academicLevel?: string; license?: string } | null;
      if (navState?.fileUrl) {
        setDocItem({
          id: id || 'doc',
          title: navState.title || 'Document Reader',
          description: navState.description,
          fileUrl: navState.fileUrl,
          academicLevel: navState.academicLevel,
          license: navState.license,
        });
        setLoading(false);
        return;
      }

      // Try reading as a Book first (hits GET /books/:id/read with origin-to-R2 caching)
      try {
        const bookData = await apiFetch(`/books/${id}/read`);
        if (bookData?.fileUrl && bookData?.book) {
          setDocItem({
            id: bookData.book.id,
            title: bookData.book.title,
            description: bookData.book.description,
            fileUrl: bookData.fileUrl,
            academicLevel: bookData.book.academicLevel,
            license: bookData.book.license,
            cached: bookData.cached,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fallback to Submissions endpoint if not a book
      }

      // Try reading as a Submission
      try {
        const subData = await apiFetch(`/submissions/${id}`);
        if (subData?.fileUrl) {
          setDocItem({
            id: subData.id,
            title: subData.title,
            description: subData.description,
            fileUrl: subData.fileUrl,
            academicLevel: subData.academicLevel,
            license: subData.license,
          });
          setLoading(false);
          return;
        }
      } catch (e: any) {
        setError(e.message || 'Document not found or storage is unavailable');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, location.state]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfError(false);
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading document reader & verifying storage cache...</p>
      </div>
    );
  }

  if (error || !docItem) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <div className="glass-card text-center">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3>Failed to Load Document</h3>
          <p className="text-secondary text-sm mt-2 mb-6">{error || 'The requested document could not be found.'}</p>
          <div className="flex justify-center gap-4">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <Link to="/browse" className="btn btn-primary">
              Browse Open Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = docItem.fileUrl;

  return (
    <div className="animate-fade-in flex flex-col items-center">
      {/* Top Controls Bar */}
      <div className="w-full flex justify-between items-center mb-6" style={{ maxWidth: '840px', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
            ← Back
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{docItem.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {docItem.license && (
                <span className="badge badge-public-domain">
                  {docItem.license}
                </span>
              )}
              {docItem.academicLevel && (
                <span className="badge badge-level">
                  {docItem.academicLevel.replace('_', ' ')}
                </span>
              )}
              {docItem.cached && (
                <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                  ⚡ Cached on Edge R2
                </span>
              )}
            </div>
          </div>
        </div>

        {pdfUrl && (
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}
          >
            📥 Download PDF
          </a>
        )}
      </div>

      {/* Abstract Card */}
      {docItem.description && (
        <div className="glass-card mb-6" style={{ maxWidth: '840px', width: '100%', padding: '1.25rem' }}>
          <h4 className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description / Abstract</h4>
          <p className="text-secondary text-sm">{docItem.description}</p>
        </div>
      )}

      {/* PDF Viewer Glass Frame */}
      <div className="glass-card flex flex-col items-center" style={{ maxWidth: '840px', width: '100%', padding: '1.5rem', minHeight: '500px' }}>
        {pdfError ? (
          <div className="empty-state" style={{ width: '100%' }}>
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">Unable to Render PDF Preview</div>
            <div className="empty-state-desc">
              Browser-based PDF rendering was blocked or storage is unavailable. You can download the PDF file directly below.
            </div>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              Download & Open PDF
            </a>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => {
              console.error('PDF load error:', err);
              setPdfError(true);
            }}
            loading={
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Rendering pages...</p>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true} 
              renderAnnotationLayer={true} 
              width={750} 
            />
          </Document>
        )}

        {/* Page Control Bar */}
        {numPages && numPages > 0 && !pdfError && (
          <div className="flex items-center gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--glass-border)', width: '100%', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              disabled={pageNumber <= 1} 
              onClick={() => setPageNumber(prev => prev - 1)}
              style={{ padding: '0.4rem 0.85rem' }}
            >
              ← Previous
            </button>

            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Page <strong style={{ color: 'var(--text-primary)' }}>{pageNumber}</strong> of {numPages}
            </span>

            <button 
              className="btn btn-secondary" 
              disabled={pageNumber >= numPages} 
              onClick={() => setPageNumber(prev => prev + 1)}
              style={{ padding: '0.4rem 0.85rem' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
