import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, FileText, Users, Upload, AlertTriangle, Ban, Scale, RefreshCcw, Mail } from 'lucide-react';
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

export const TermsOfUse: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Terms of Use — Curious Bright';
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
          <FileText size={14} />
          <span>TERMS OF USE</span>
        </div>
        <h1>Rules of the Notebook</h1>
        <p>
          By accessing or using Curious Bright, you agree to these Terms of Use. Please read
          them carefully. They are written in plain language — if anything is unclear, contact
          us before using the platform.
        </p>
        <div className="policy-meta">
          <span>Last updated: August 4, 2026</span>
          <span className="policy-meta-dot">•</span>
          <span>Effective: August 4, 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="policy-content">

        <Section icon={<Users size={18} />} title="1. Who Can Use Curious Bright">
          <p>
            Curious Bright is an open-access platform designed for students (high school and above),
            researchers, educators, and academic institutions. By registering, you confirm that:
          </p>
          <ul>
            <li>You are at least 13 years old (or 16 in the European Economic Area).</li>
            <li>
              If you are under 18, you have obtained the consent of a parent or legal guardian.
            </li>
            <li>You will provide accurate information when creating your account.</li>
            <li>You are responsible for maintaining the security of your credentials.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that provide false registration
            information.
          </p>
        </Section>

        <Section icon={<Upload size={18} />} title="2. Content You Submit">
          <p>
            When you upload a manuscript, paper, or any document to Curious Bright ("Submitted
            Content"), you represent and warrant that:
          </p>
          <ul>
            <li>
              You are the original author, or you have obtained all necessary rights and permissions
              to submit the content.
            </li>
            <li>
              The content does not infringe any copyright, patent, trademark, trade secret, or
              other intellectual property right of any third party.
            </li>
            <li>
              The content is not defamatory, fraudulent, obscene, or otherwise unlawful.
            </li>
            <li>
              The content does not contain personal data of third parties without their consent.
            </li>
          </ul>
          <p>
            By submitting content, you grant Curious Bright a{' '}
            <strong>non-exclusive, royalty-free, worldwide license</strong> to host, cache, display,
            and distribute your content on the platform for the purpose of providing the service.
            You retain full ownership of your intellectual property.
          </p>
          <p>
            Approved submissions are published under an{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY 4.0 license
            </a>{' '}
            by default, making them freely reusable with attribution. If you wish to publish under
            a different open license, state it clearly in your submission.
          </p>
        </Section>

        <Section icon={<AlertTriangle size={18} />} title="3. Community & Study Rooms">
          <p>
            Study Rooms are real-time collaborative spaces. By participating in Study Rooms, you
            agree to:
          </p>
          <ul>
            <li>Treat all participants with respect — harassment, hate speech, and personal attacks are not tolerated.</li>
            <li>Not share another user's private information without their explicit consent.</li>
            <li>Not use Study Rooms to coordinate academic dishonesty (e.g., exam cheating).</li>
            <li>Not flood rooms with spam or automated messages.</li>
            <li>Not impersonate other users, educators, or Curious Bright staff.</li>
          </ul>
          <p>
            Room admins and platform moderators may remove messages, remove members, or close
            rooms that violate these rules. Repeated violations may result in account suspension.
          </p>
        </Section>

        <Section icon={<Ban size={18} />} title="4. Prohibited Uses">
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>
              Use the platform to transmit malware, viruses, or any malicious code.
            </li>
            <li>
              Attempt to circumvent rate limiting, authentication, or access controls.
            </li>
            <li>
              Scrape or harvest user data, content, or email addresses from the platform in bulk
              without prior written consent.
            </li>
            <li>
              Use the API, upload endpoints, or search functionality for commercial data aggregation
              without a separate agreement.
            </li>
            <li>
              Upload copyrighted textbooks or materials obtained illegally.
            </li>
            <li>
              Create multiple accounts to evade a ban or circumvent submission limits.
            </li>
            <li>
              Use the platform for any purpose that is illegal under applicable law.
            </li>
          </ul>
        </Section>

        <Section icon={<Scale size={18} />} title="5. Moderation & Enforcement">
          <p>
            Curious Bright uses a community moderation model supported by volunteer moderators
            and administrators. Content is subject to review before publication.
          </p>
          <ul>
            <li>
              We reserve the right to reject, unpublish, or remove any content that violates these
              Terms at our sole discretion.
            </li>
            <li>
              Accounts may be suspended or permanently banned for serious or repeated violations.
            </li>
            <li>
              You may report problematic content or users using the in-app report feature. False
              reports made in bad faith may result in consequences for the reporting user.
            </li>
            <li>
              Moderator decisions can be appealed by contacting{' '}
              <a href="mailto:moderation@curiousbright.com.ng">moderation@curiousbright.com.ng</a>.
            </li>
          </ul>
        </Section>

        <Section icon={<FileText size={18} />} title="6. Open Source & Platform Code">
          <p>
            The Curious Bright platform source code is open source, licensed under the{' '}
            <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">
              GNU General Public License v3 (GPL-3.0)
            </a>
            . You are free to study, modify, and self-host the code under the terms of that license.
          </p>
          <p>
            The Curious Bright name, logo, and branding are <strong>not</strong> covered by the
            open-source license and may not be used without written permission to avoid confusion
            with the official platform.
          </p>
        </Section>

        <Section icon={<AlertTriangle size={18} />} title="7. Disclaimer of Warranties">
          <p>
            Curious Bright is provided <strong>"as is"</strong> and{' '}
            <strong>"as available"</strong> without warranties of any kind, express or implied,
            including but not limited to warranties of merchantability, fitness for a particular
            purpose, or non-infringement.
          </p>
          <p>
            We do not guarantee that the platform will be uninterrupted, error-free, or free of
            viruses. Academic content published by users represents the views of the submitting
            author and does not constitute endorsement by Curious Bright.
          </p>
        </Section>

        <Section icon={<Scale size={18} />} title="8. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, Curious Bright and its contributors shall not
            be liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of, or inability to use, the platform — including loss of data,
            revenue, or academic opportunities.
          </p>
          <p>
            Our total liability for any direct claim shall not exceed the amount you paid for the
            platform in the 12 months prior to the claim (which for free users is $0).
          </p>
        </Section>

        <Section icon={<RefreshCcw size={18} />} title="9. Changes to These Terms">
          <p>
            We may update these Terms of Use from time to time as the platform evolves. When we
            make material changes, we will:
          </p>
          <ul>
            <li>Post the revised Terms on this page with an updated "Last updated" date.</li>
            <li>Send a notification to registered users via in-app alert.</li>
          </ul>
          <p>
            Continued use of Curious Bright after changes take effect constitutes your acceptance
            of the revised Terms. If you do not agree to the new Terms, you should stop using the
            platform and request account deletion.
          </p>
        </Section>

        <Section icon={<Scale size={18} />} title="10. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of the Federal
            Republic of Nigeria, without regard to its conflict-of-law provisions. Any disputes
            arising from these Terms or your use of the platform shall be resolved through good-faith
            negotiation first, and thereafter through the courts of Nigeria.
          </p>
        </Section>

        <Section icon={<Mail size={18} />} title="11. Contact Us">
          <p>
            Questions about these Terms? Get in touch:
          </p>
          <ul>
            <li>
              <strong>General:</strong>{' '}
              <a href="mailto:hello@curiousbright.com.ng">hello@curiousbright.com.ng</a>
            </li>
            <li>
              <strong>Moderation appeals:</strong>{' '}
              <a href="mailto:moderation@curiousbright.com.ng">moderation@curiousbright.com.ng</a>
            </li>
            <li>
              <strong>Legal:</strong>{' '}
              <a href="mailto:legal@curiousbright.com.ng">legal@curiousbright.com.ng</a>
            </li>
          </ul>
        </Section>

        <div className="policy-footer-note">
          These Terms of Use apply to all users of Curious Bright, including visitors who do not
          register. By accessing any part of the platform, you acknowledge you have read and
          understood these Terms.
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
