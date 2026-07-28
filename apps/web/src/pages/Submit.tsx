import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const ACADEMIC_LEVELS = [
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'COLLEGE', label: 'College / Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate / Postgraduate' },
  { value: 'PROFESSIONAL', label: 'Professional / Research Scholar' },
  { value: 'MIDDLE_SCHOOL', label: 'Middle School' },
  { value: 'ELEMENTARY', label: 'Elementary' },
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
      setError('Please select a PDF research document.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Step 1: Request presigned upload URL
      setStatusStep('Generating secure upload URL...');
      const { uploadUrl, fileKey } = await apiFetch('/submissions/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });

      // Step 2: Upload file directly to S3 / MinIO storage
      setStatusStep('Uploading document to storage repository...');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage bucket');
      }

      // Step 3: Register submission record in backend
      setStatusStep('Finalizing submission record...');
      await apiFetch('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          fileUrl: fileKey, // Backend expects fileUrl
          academicLevel,
          license: 'CC-BY-4.0'
        })
      });

      navigate('/browse');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to complete paper submission');
    } finally {
      setLoading(false);
      setStatusStep('');
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Submit Research Paper</h2>
          <p className="text-muted text-sm mt-2">Publish your paper to the Curious Bright peer-reviewed repository</p>
        </div>
        <Link to="/browse" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
          ← Back to Repository
        </Link>
      </div>

      <div className="glass-card">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
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
              placeholder="e.g. Deep Neural Architectures in Quantum Simulations"
            />
          </div>

          <div className="form-group">
            <label>Target Academic Level</label>
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
            <label>Abstract / Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              placeholder="Provide a detailed abstract summarizing your research, methodology, and key conclusions..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>PDF Document</label>
            <div style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
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
                <div className="text-sm mt-2" style={{ color: 'var(--success)', fontWeight: 500 }}>
                  ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>

          {loading && statusStep && (
            <div className="alert alert-info mt-4">
              <div className="spinner" style={{ width: 16, height: 16 }}></div>
              <span>{statusStep}</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/browse')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : '🚀 Submit for Moderation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
