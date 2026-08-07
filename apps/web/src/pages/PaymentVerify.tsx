import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.curiousbright.com.ng';
        const res = await fetch(`${apiUrl}/payment/verify/${reference}`);
        const data = await res.json();

        if (res.ok && data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Thank you.');
          
          // Optionally, redirect to a success page or dashboard after a few seconds
          setTimeout(() => {
            navigate('/browse', { replace: true });
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.error || 'Payment verification failed or was not successful.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('An error occurred while verifying the payment.');
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {status === 'loading' && (
          <>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '3rem', color: 'var(--color-brand)' }}></i>
            <h2 style={{ marginTop: '1rem', color: 'var(--color-ink)' }}>Verifying Payment...</h2>
            <p style={{ color: 'var(--color-ink-light)' }}>Please don't close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <i className="bx bxs-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
            <h2 style={{ marginTop: '1rem', color: '#10b981' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--color-ink-light)', marginBottom: '1rem' }}>{message}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-light)' }}>Redirecting...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <i className="bx bxs-x-circle" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
            <h2 style={{ marginTop: '1rem', color: '#ef4444' }}>Payment Failed</h2>
            <p style={{ color: 'var(--color-ink-light)' }}>{message}</p>
            <button 
              onClick={() => navigate('/browse')}
              style={{ marginTop: '1.5rem', background: 'var(--color-brand)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
