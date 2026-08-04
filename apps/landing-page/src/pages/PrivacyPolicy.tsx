import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Shield, Eye, Lock, Database, Globe, Bell, Mail, Trash2 } from 'lucide-react';
import { colors } from '@curious-bright/ui-kit';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="policy-section">
    <div className="policy-section-header">
      <div className="policy-section-icon">{icon}</div>
      <h2>{title}</h2>
    </div>
    <div className="policy-section-body">{children}</div>
  </div>
);

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Privacy Policy — Curious Bright';
  }, []);

  return (
    <div className="policy-page">
      {/* Sticky Nav */}
      <header className="policy-nav">
        <div className="policy-nav-inner">
          <Link to="/" className="policy-nav-logo">
            <div className="policy-nav-logo-icon" style={{ backgroundColor: colors.ink }}>
              <BookOpen size={16} color="#F7F6F2" />
            </div>
            <span>Curious Bright</span>
          </Link>
          <Link to="/" className="policy-back-btn">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="policy-hero">
        <div className="policy-hero-badge">
          <Shield size={14} />
          <span>PRIVACY POLICY</span>
        </div>
        <h1>Your Privacy, Protected</h1>
        <p>
          Curious Bright is an open-access academic platform. We collect only what we need
          to run the service, we never sell your data, and we give you full control over
          everything you share with us.
        </p>
        <div className="policy-meta">
          <span>Last updated: August 4, 2026</span>
          <span className="policy-meta-dot">•</span>
          <span>Effective: August 4, 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="policy-content">

        <Section icon={<Eye size={18} />} title="1. What We Collect">
          <p>We collect the minimum information necessary to operate the platform:</p>
          <ul>
            <li>
              <strong>Account data</strong> — your name, email address, school name, and hashed
              password when you register.
            </li>
            <li>
              <strong>Submitted content</strong> — manuscripts, papers, and PDFs/EPUBs you upload
              for publication on the platform.
            </li>
            <li>
              <strong>Room and message activity</strong> — messages you send in Study Rooms and
              which rooms you join or create.
            </li>
            <li>
              <strong>Usage metadata</strong> — request logs (IP address, timestamps, HTTP method)
              for security and performance monitoring.
            </li>
            <li>
              <strong>Device and browser info</strong> — browser type, operating system, and
              referring URL collected through standard web server logs.
            </li>
          </ul>
          <p>We do <strong>not</strong> use third-party analytics trackers (e.g. Google Analytics). We
          do <strong>not</strong> place advertising cookies. We do <strong>not</strong> fingerprint
          your device.</p>
        </Section>

        <Section icon={<Database size={18} />} title="2. How We Use Your Data">
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Authenticate your account and keep your session secure.</li>
            <li>Display your profile (name, school) alongside your published submissions.</li>
            <li>Route messages within Study Rooms you have joined.</li>
            <li>Send in-app notifications about your submission status.</li>
            <li>Detect and prevent abuse (spam, brute-force attempts, malicious uploads).</li>
            <li>Generate aggregate, anonymized platform analytics visible only to administrators.</li>
          </ul>
          <p>We never use your data to train AI models or sell insights to advertisers.</p>
        </Section>

        <Section icon={<Globe size={18} />} title="3. Publicly Visible Information">
          <p>
            By submitting a manuscript or paper, you agree that the following information will be
            publicly visible to all visitors:
          </p>
          <ul>
            <li>Your display name and school affiliation (as entered at registration).</li>
            <li>The title, abstract, and file content of your approved submission.</li>
            <li>Your Study Room membership and participation in public rooms.</li>
          </ul>
          <p>
            If you wish to publish anonymously or under a pseudonym, please set your display name
            accordingly before submitting.
          </p>
        </Section>

        <Section icon={<Lock size={18} />} title="4. Data Storage & Security">
          <ul>
            <li>
              <strong>Passwords</strong> are hashed using bcrypt (cost factor 10) before storage.
              We never store plaintext passwords.
            </li>
            <li>
              <strong>Session tokens</strong> are short-lived JWTs stored as HTTP-only cookies
              (in production, scoped to Secure + SameSite=Lax).
            </li>
            <li>
              <strong>Files</strong> are stored in object storage (Cloudflare R2 / MinIO). Access
              is controlled via presigned URLs with expiry windows.
            </li>
            <li>
              <strong>Database</strong> access is restricted to backend services only — never
              exposed to the public internet.
            </li>
            <li>
              <strong>Rate limiting</strong> is applied globally and per-route to block abuse
              and brute-force attacks.
            </li>
            <li>
              <strong>CORS</strong> is configured to allow only known Curious Bright origins.
            </li>
          </ul>
          <p>
            Despite our best efforts, no internet transmission is 100% secure. If you discover a
            security vulnerability, please report it to{' '}
            <a href="mailto:security@curiousbright.com.ng">security@curiousbright.com.ng</a>{' '}
            before public disclosure.
          </p>
        </Section>

        <Section icon={<Bell size={18} />} title="5. Notifications & Push">
          <p>
            We may send you in-app notifications (e.g., "Your submission was approved") via
            push notifications or in-app alerts. You can manage notification preferences in your
            account settings. We do not send marketing emails without your explicit opt-in.
          </p>
        </Section>

        <Section icon={<Globe size={18} />} title="6. Third-Party Services">
          <p>We use the following third-party infrastructure providers:</p>
          <ul>
            <li>
              <strong>Cloudflare R2</strong> — file and document storage. Files are encrypted
              at rest and in transit.
            </li>
            <li>
              <strong>Typesense</strong> — open-source search engine running on our
              infrastructure (not a cloud SaaS).
            </li>
            <li>
              <strong>LiveKit</strong> — real-time audio/video signaling for Study Rooms.
            </li>
            <li>
              <strong>Expo Push Notifications</strong> — mobile push delivery for our app
              users.
            </li>
          </ul>
          <p>
            We do not share personally identifiable information with any third party beyond what
            is strictly required to deliver these services.
          </p>
        </Section>

        <Section icon={<Trash2 size={18} />} title="7. Data Retention & Deletion">
          <ul>
            <li>Account data is retained until you request deletion.</li>
            <li>
              Approved submissions remain public after deletion to preserve academic
              reference integrity — you may request content redaction by contacting us.
            </li>
            <li>Server logs are retained for up to 90 days for security purposes.</li>
          </ul>
          <p>
            To request deletion of your account and associated data, email{' '}
            <a href="mailto:privacy@curiousbright.com.ng">privacy@curiousbright.com.ng</a>.
            We will process requests within 30 days.
          </p>
        </Section>

        <Section icon={<Shield size={18} />} title="8. Children's Privacy">
          <p>
            Curious Bright is designed for high school students, university students, researchers,
            and educators. We do not knowingly collect personal information from children under 13
            (or under 16 in the European Economic Area). If you believe a child has provided us
            personal data, please contact us immediately and we will delete it promptly.
          </p>
        </Section>

        <Section icon={<Globe size={18} />} title="9. International Users">
          <p>
            Curious Bright is operated from Nigeria and serves users globally. By using the
            platform, you consent to your data being processed in Nigeria and, via our
            infrastructure providers, potentially in other jurisdictions. We comply with
            applicable data protection regulations on a best-effort basis.
          </p>
        </Section>

        <Section icon={<Mail size={18} />} title="10. Contact Us">
          <p>
            If you have questions, concerns, or requests about this Privacy Policy, please reach
            out:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@curiousbright.com.ng">privacy@curiousbright.com.ng</a>
            </li>
            <li>
              <strong>Security disclosures:</strong>{' '}
              <a href="mailto:security@curiousbright.com.ng">security@curiousbright.com.ng</a>
            </li>
            <li>
              <strong>Website:</strong>{' '}
              <a href="https://curiousbright.com.ng">curiousbright.com.ng</a>
            </li>
          </ul>
        </Section>

        <div className="policy-footer-note">
          We may update this Privacy Policy from time to time. Changes will be posted on this
          page with an updated "Last updated" date. Continued use of Curious Bright after changes
          constitutes acceptance of the revised policy.
        </div>
      </div>

      {/* Page footer */}
      <footer className="policy-page-footer">
        <p>© {new Date().getFullYear()} Curious Bright. Open Source &amp; Open Access.</p>
        <div className="policy-page-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms">Terms of Use</Link>
          <span>•</span>
          <Link to="/">Home</Link>
        </div>
      </footer>
    </div>
  );
};
