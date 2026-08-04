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

export default function TermsOfUse() {
  useEffect(() => {
    document.title = 'Terms of Use — Curious Bright';
  }, []);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="policy-badge">
          <i className="bx bx-file-blank" />
          <span>TERMS OF USE</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0.75rem 0 0.75rem' }}>
          Rules of the Notebook
        </h1>
        <p style={{ color: 'var(--color-faded-ink)', maxWidth: '580px', lineHeight: 1.7 }}>
          By using Curious Bright, you agree to these Terms. They are written in plain language — if anything is unclear, contact us before using the platform.
        </p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-faded-ink)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>Last updated: August 4, 2026</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <Link to="/privacy" style={{ color: 'var(--color-teal)', textDecoration: 'none' }}>View Privacy Policy →</Link>
        </div>
      </div>

      <div className="policy-sections">
        <Section icon="bx-group" title="1. Who Can Use Curious Bright">
          <p>Curious Bright is designed for students (high school and above), researchers, educators, and institutions. By registering, you confirm that:</p>
          <ul>
            <li>You are at least 13 years old (or 16 in the EEA).</li>
            <li>If under 18, you have parental or guardian consent.</li>
            <li>You will provide accurate registration information.</li>
            <li>You are responsible for maintaining the security of your credentials.</li>
          </ul>
        </Section>

        <Section icon="bx-upload" title="2. Content You Submit">
          <p>When you upload content to Curious Bright, you confirm that:</p>
          <ul>
            <li>You are the original author or have all necessary rights to submit it.</li>
            <li>It does not infringe any copyright, patent, or trademark.</li>
            <li>It is not defamatory, fraudulent, obscene, or otherwise unlawful.</li>
            <li>It does not contain personal data of third parties without their consent.</li>
          </ul>
          <p>By submitting, you grant Curious Bright a <strong>non-exclusive, royalty-free, worldwide license</strong> to host, cache, display, and distribute your content. You retain full ownership of your IP.</p>
          <p>Approved submissions are published under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> by default — freely reusable with attribution. State a different open license in your submission if needed.</p>
        </Section>

        <Section icon="bx-conversation" title="3. Community & Study Rooms">
          <p>By participating in Study Rooms, you agree to:</p>
          <ul>
            <li>Treat all participants with respect — harassment and hate speech are not tolerated.</li>
            <li>Not share another user's private information without their explicit consent.</li>
            <li>Not use Study Rooms to coordinate academic dishonesty.</li>
            <li>Not flood rooms with spam or automated messages.</li>
            <li>Not impersonate other users, educators, or Curious Bright staff.</li>
          </ul>
        </Section>

        <Section icon="bx-block" title="4. Prohibited Uses">
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>Transmit malware, viruses, or any malicious code.</li>
            <li>Circumvent rate limiting, authentication, or access controls.</li>
            <li>Scrape or harvest user data or content in bulk without written consent.</li>
            <li>Use upload endpoints or the API for commercial data aggregation without a separate agreement.</li>
            <li>Upload copyrighted textbooks or materials obtained illegally.</li>
            <li>Create multiple accounts to evade a ban or circumvent submission limits.</li>
          </ul>
        </Section>

        <Section icon="bx-shield-quarter" title="5. Moderation & Enforcement">
          <ul>
            <li>We may reject, unpublish, or remove any content that violates these Terms.</li>
            <li>Accounts may be suspended or permanently banned for serious or repeated violations.</li>
            <li>Report problematic content using the in-app report feature.</li>
            <li>Moderator decisions can be appealed at <a href="mailto:moderation@curiousbright.com.ng">moderation@curiousbright.com.ng</a>.</li>
          </ul>
        </Section>

        <Section icon="bx-code-alt" title="6. Open Source & Branding">
          <p>The Curious Bright platform is open source, licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GPL-3.0</a>. You may study, modify, and self-host it under that licence.</p>
          <p>The Curious Bright name, logo, and branding are <strong>not</strong> covered by the open-source licence and may not be used without written permission.</p>
        </Section>

        <Section icon="bx-info-circle" title="7. Disclaimer & Limitation of Liability">
          <p>Curious Bright is provided <strong>"as is"</strong> without warranties of any kind. We do not guarantee uninterrupted or error-free service. Academic content represents the views of the submitting author, not Curious Bright.</p>
          <p>To the fullest extent permitted by law, our total liability for any direct claim shall not exceed the amount you paid for the platform in the prior 12 months (which for free users is $0).</p>
        </Section>

        <Section icon="bx-globe" title="8. Governing Law">
          <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved through good-faith negotiation first, and thereafter through Nigerian courts.</p>
        </Section>

        <Section icon="bx-envelope" title="9. Contact Us">
          <ul>
            <li><strong>General:</strong> <a href="mailto:hello@curiousbright.com.ng">hello@curiousbright.com.ng</a></li>
            <li><strong>Moderation appeals:</strong> <a href="mailto:moderation@curiousbright.com.ng">moderation@curiousbright.com.ng</a></li>
            <li><strong>Legal:</strong> <a href="mailto:legal@curiousbright.com.ng">legal@curiousbright.com.ng</a></li>
          </ul>
        </Section>

        <div className="policy-footer-note">
          By accessing any part of Curious Bright, you acknowledge you have read and understood these Terms of Use. We may update them from time to time — continued use after changes constitutes acceptance.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
          <Link to="/privacy" className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}>
            <i className="bx bx-shield-alt-2" />
            Read Privacy Policy
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
