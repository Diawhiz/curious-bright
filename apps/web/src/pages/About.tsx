import { Link } from 'react-router-dom';

const features = [
  {
    icon: '📚',
    title: 'Open Library',
    desc: 'Access thousands of curated research papers, textbooks, and academic resources — freely available to all members.',
  },
  {
    icon: '💬',
    title: 'Study Rooms',
    desc: 'Join real-time collaborative study rooms with live video, audio, and interactive whiteboards for group learning.',
  },
  {
    icon: '✏️',
    title: 'Live Whiteboard',
    desc: 'Draw, annotate, and brainstorm together on a shared digital canvas — perfect for explaining complex concepts.',
  },
  {
    icon: '📤',
    title: 'Submit Research',
    desc: 'Contribute your own papers and research to the community. Every submission goes through a moderation review.',
  },
  {
    icon: '🛡️',
    title: 'Moderated Content',
    desc: 'Our expert moderation team ensures all content meets academic standards before it reaches the library.',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Powered by Typesense, our full-text search finds the exact papers and resources you need — instantly.',
  },
];

const stats = [
  { value: '10,000+', label: 'Research Papers' },
  { value: '500+', label: 'Active Study Rooms' },
  { value: '25,000+', label: 'Learners Worldwide' },
  { value: '98%', label: 'Content Accuracy' },
];

const team = [
  { name: 'Research Curation', role: 'Library & Content', emoji: '📖' },
  { name: 'Platform Engineering', role: 'Infrastructure & Dev', emoji: '⚙️' },
  { name: 'Community Moderation', role: 'Trust & Safety', emoji: '🛡️' },
  { name: 'Academic Partnerships', role: 'Institutions & Outreach', emoji: '🤝' },
];

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '4rem' }} className="animate-fade-in">

      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '1rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc',
          marginBottom: '1.5rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          ✨ Open Academic Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #a5b4fc 50%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Where Curiosity Meets<br />Bright Ideas
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: 580,
          margin: '0 auto 2rem',
          lineHeight: 1.7,
        }}>
          CuriousBright is a collaborative academic platform built for students, researchers,
          and lifelong learners to discover, share, and study together — in real time.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/browse" id="about-explore-library" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}>
            Explore the Library →
          </Link>
          <Link to="/register" id="about-join-free" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}>
            Join for Free
          </Link>
        </div>
      </section>

      {/* Stats row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '3.5rem',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              marginBottom: '0.25rem',
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className="glass-card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}>
            🎯
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.375rem' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem' }}>
              Knowledge should be accessible to everyone — not locked behind paywalls or institutional barriers.
              CuriousBright was founded on the belief that collaborative learning accelerates discovery. We provide
              a free, open platform where academic research meets real-time community.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              Whether you're a student cramming for exams, a researcher exploring new fields, or a self-taught
              learner following your passions — CuriousBright is your academic home.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>What We Offer</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
          Everything you need to learn, collaborate, and grow.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1.25rem',
        }}>
          {features.map((f) => (
            <div key={f.title} className="glass-card glass-card-interactive" style={{ padding: '1.5rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.375rem',
                marginBottom: '1rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700 }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="glass-card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.75rem', fontSize: '1.375rem' }}>How It Works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Create your account', desc: 'Sign up for free in under 60 seconds. No credit card required.' },
            { step: '02', title: 'Explore the library', desc: 'Browse thousands of research papers and academic resources across all disciplines.' },
            { step: '03', title: 'Join a study room', desc: 'Connect with learners in real-time — video, audio, chat, and live whiteboards.' },
            { step: '04', title: 'Contribute & grow', desc: 'Submit your own research, help others learn, and build your academic reputation.' },
          ].map((item, i) => (
            <div key={item.step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                background: i === 0 ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'rgba(99,102,241,0.08)',
                border: i === 0 ? 'none' : '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8125rem',
                color: i === 0 ? '#fff' : '#a5b4fc',
                boxShadow: i === 0 ? '0 4px 14px var(--accent-glow)' : 'none',
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Our Teams</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Dedicated people keeping CuriousBright running and growing.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {team.map((t) => (
            <div key={t.name} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Ready to start learning?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', maxWidth: 480, margin: '0 auto 1.75rem' }}>
          Join thousands of curious minds already using CuriousBright to accelerate their learning journey.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" id="about-cta-register" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Get Started Free →
          </Link>
          <Link to="/browse" id="about-cta-browse" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
            Browse Papers
          </Link>
        </div>
      </section>

      {/* Footer note */}
      <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        CuriousBright is open source and community-driven. ·{' '}
        <Link to="/apply-moderator" style={{ color: 'var(--accent)' }}>Apply as Moderator</Link>
        {' '}·{' '}
        <Link to="/mod-login" style={{ color: 'var(--accent)' }}>Moderator Portal</Link>
      </p>
    </div>
  );
}
