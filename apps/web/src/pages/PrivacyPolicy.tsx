import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="policy-card">
    <div className="policy-card-header">
      <i className={`bx ${icon}`} style={{ fontSize: '1.1rem', color: 'var(--color-coral)' }} />
      <h2 className="policy-card-title">{title}</h2>
    </div>
    <div className="policy-card-body">{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy — Curious Bright';
  }, []);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="policy-badge">
          <i className="bx bx-shield-alt-2" />
          <span>PRIVACY POLICY</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0.75rem 0 0.75rem' }}>
          Your Privacy, Protected
        </h1>
        <p style={{ color: 'var(--color-faded-ink)', maxWidth: '580px', lineHeight: 1.7 }}>
          We collect only what we need to run the platform, we never sell your data, and you stay in full control of everything you share.
        </p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-faded-ink)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>Last updated: August 4, 2026</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <Link to="/terms" style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>View Terms of Use →</Link>
        </div>
      </div>

      <div className="policy-sections">
        <Section icon="bx-show" title="1. What We Collect">
          <p>We collect the minimum information necessary to operate the platform:</p>
          <ul>
            <li><strong>Account data</strong> — your name, email address, school name, and hashed password when you register.</li>
            <li><strong>Submitted content</strong> — manuscripts, papers, and PDFs/EPUBs you upload for publication.</li>
            <li><strong>Room & message activity</strong> — messages you send in Study Rooms and which rooms you join or create.</li>
            <li><strong>Usage metadata</strong> — request logs (IP address, timestamps, HTTP method) for security monitoring.</li>
            <li><strong>Device & browser info</strong> — browser type, OS, and referring URL via standard web server logs.</li>
          </ul>
          <p>We do <strong>not</strong> use third-party analytics trackers, advertising cookies, or device fingerprinting.</p>
        </Section>

        <Section icon="bx-data" title="2. How We Use Your Data">
          <ul>
            <li>Authenticate your account and keep your session secure.</li>
            <li>Display your profile (name, school) alongside your published submissions.</li>
            <li>Route messages within Study Rooms you have joined.</li>
            <li>Send in-app notifications about your submission status.</li>
            <li>Detect and prevent abuse (spam, brute-force, malicious uploads).</li>
            <li>Generate aggregate, anonymised platform analytics visible only to administrators.</li>
          </ul>
          <p>We <strong>never</strong> use your data to train AI models or sell insights to advertisers.</p>
        </Section>

        <Section icon="bx-globe" title="3. Publicly Visible Information">
          <p>By submitting a manuscript, you agree that the following will be public:</p>
          <ul>
            <li>Your display name and school affiliation (as entered at registration).</li>
            <li>The title, abstract, and file content of your approved submission.</li>
            <li>Your Study Room membership in public rooms.</li>
          </ul>
          <p>To publish anonymously, set your display name accordingly before submitting.</p>
        </Section>

        <Section icon="bx-lock-alt" title="4. Data Storage & Security">
          <ul>
            <li><strong>Passwords</strong> are hashed using bcrypt (cost 10). Plaintext passwords are never stored.</li>
            <li><strong>Session tokens</strong> are short-lived JWTs stored in HTTP-only cookies (Secure + SameSite=Lax in production).</li>
            <li><strong>Files</strong> are stored in Cloudflare R2 / MinIO, accessed via presigned URLs.</li>
            <li><strong>Database</strong> access is restricted to backend services only.</li>
            <li><strong>Rate limiting</strong> is applied globally and per-route to block brute-force attacks.</li>
            <li><strong>CORS</strong> is configured to allow only known Curious Bright origins.</li>
          </ul>
          <p>Security issues? Email <a href="mailto:security@curiousbright.com.ng">security@curiousbright.com.ng</a>.</p>
        </Section>

        <Section icon="bx-trash" title="5. Data Retention & Deletion">
          <ul>
            <li>Account data is retained until you request deletion.</li>
            <li>Approved submissions remain public after account deletion to preserve academic reference integrity. Request redaction by contacting us.</li>
            <li>Server logs are retained for up to 90 days for security purposes.</li>
          </ul>
          <p>To delete your account, email <a href="mailto:privacy@curiousbright.com.ng">privacy@curiousbright.com.ng</a>. We process requests within 30 days.</p>
        </Section>

        <Section icon="bx-plug" title="6. Third-Party Services">
          <ul>
            <li><strong>Cloudflare R2</strong> — file storage, encrypted at rest and in transit.</li>
            <li><strong>Typesense</strong> — self-hosted open-source search engine.</li>
            <li><strong>LiveKit</strong> — real-time audio/video for Study Rooms.</li>
            <li><strong>Expo Push</strong> — mobile push notification delivery.</li>
          </ul>
          <p>No personally identifiable information is shared with third parties beyond what is strictly required to deliver these services.</p>
        </Section>

        <Section icon="bx-envelope" title="7. Contact Us">
          <ul>
            <li><strong>Privacy:</strong> <a href="mailto:privacy@curiousbright.com.ng">privacy@curiousbright.com.ng</a></li>
            <li><strong>Security disclosures:</strong> <a href="mailto:security@curiousbright.com.ng">security@curiousbright.com.ng</a></li>
            <li><strong>Website:</strong> <a href="https://curiousbright.com.ng" target="_blank" rel="noopener noreferrer">curiousbright.com.ng</a></li>
          </ul>
        </Section>

        <div className="policy-footer-note">
          We may update this Privacy Policy from time to time. Changes will be posted here with an updated "Last updated" date. Continued use of Curious Bright after changes constitutes acceptance.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
          <Link to="/terms" className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}>
            <i className="bx bx-file" />
            Read Terms of Use
          </Link>
          <Link to="/browse" className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}>
            <i className="bx bx-book-open" />
            Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
}
