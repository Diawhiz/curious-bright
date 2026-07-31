import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { CommentCornerCard } from '../components/CommentCornerCard';
import { HighlighterText } from '../components/HighlighterText';

const ACADEMIC_LEVELS = [
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'COLLEGE', label: 'College / Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate / Postgraduate' },
  { value: 'PROFESSIONAL', label: 'Professional / Independent Scholar' },
];

export default function Submit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [academicLevel, setAcademicLevel] = useState('COLLEGE');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF document to share.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      setStatusStep('Preparing secure link for your document...');
      const { uploadUrl, fileKey } = await apiFetch('/submissions/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });

      setStatusStep('Saving your paper safely into the repository...');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Could not upload file to storage repository');
      }

      setStatusStep('Finalizing your publication record...');
      await apiFetch('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          fileUrl: fileKey,
          academicLevel,
          license: 'CC-BY-4.0'
        })
      });

      navigate('/browse');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'We could not complete your paper submission');
    } finally {
      setLoading(false);
      setStatusStep('');
    }
  };

  return (
    <div style={{ maxWidth: '660px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>
            <HighlighterText color="#FF5A36">Share a Research Paper</HighlighterText>
          </h2>
          <p className="text-muted text-sm mt-2">Publish your work to the Curious Bright shared notebook repository</p>
        </div>
        <Link to="/browse" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}>
          ← Back to Library
        </Link>
      </div>

      <CommentCornerCard commentPreview="Peel corner to inspect publishing tips">
        {error && (
          <div className="alert alert-error mb-4">
            <span>⚠️ {error}</span>
            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paper Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Neural Architectures in Quantum Simulations"
            />
          </div>

          <div className="form-group">
            <label>Learning Level</label>
            <select 
              value={academicLevel}
              onChange={e => setAcademicLevel(e.target.value)}
              required
            >
              {ACADEMIC_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Summary / Abstract</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              placeholder="Provide a clear summary outlining your research, core methodology, and key conclusions..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>PDF Document File</label>
            <div style={{
              border: '1.5px dashed var(--color-line-dark)',
              borderRadius: '4px 0px 4px 4px',
              padding: '1.75rem',
              textAlign: 'center',
              background: 'var(--color-paper)',
              cursor: 'pointer',
            }}>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                required 
                style={{ cursor: 'pointer' }}
              />
              {file && (
                <div className="text-sm mt-2" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
                  ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>

          {loading && statusStep && (
            <div className="alert alert-info mt-4">
              <span>✨ {statusStep}</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: '1.5px solid var(--color-line)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/browse')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : '🚀 Publish Paper'}
            </button>
          </div>
        </form>
      </CommentCornerCard>
    </div>
  );
}
