import React, { useState } from 'react';
import { Heart, Zap, Shield, Users } from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const TIERS = [
  {
    id: 'supporter',
    label: 'Supporter',
    amount: 2000,
    currency: 'NGN',
    icon: Heart,
    color: 'var(--color-coral)',
    bgColor: 'rgba(255, 90, 54, 0.08)',
    borderColor: 'rgba(255, 90, 54, 0.3)',
    perks: ['Name in contributors list', 'Supporter badge', 'Early access to new features'],
    tagline: '₦2,000 / one-time',
  },
  {
    id: 'champion',
    label: 'Champion',
    amount: 10000,
    currency: 'NGN',
    icon: Zap,
    color: 'var(--color-teal)',
    bgColor: 'rgba(0, 168, 150, 0.08)',
    borderColor: 'rgba(0, 168, 150, 0.3)',
    perks: ['Everything in Supporter', 'Priority email support', 'Monthly impact report', 'Community spotlight'],
    tagline: '₦10,000 / one-time',
    featured: true,
  },
  {
    id: 'patron',
    label: 'Patron',
    amount: 50000,
    currency: 'NGN',
    icon: Shield,
    color: 'var(--color-mustard)',
    bgColor: 'rgba(244, 180, 61, 0.12)',
    borderColor: 'rgba(244, 180, 61, 0.4)',
    perks: ['Everything in Champion', 'Dedicated thanks on landing page', 'Direct line to founders', 'Annual impact call'],
    tagline: '₦50,000 / one-time',
  },
];

export const SponsorSection: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState(TIERS[1]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'tiers' | 'custom'>('tiers');
  const [customAmount, setCustomAmount] = useState('');

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve();
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack'));
      document.head.appendChild(script);
    });
  };

  const handleSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError('Please enter your name and email to proceed.');
      return;
    }
    
    let paymentAmount = 0;
    if (activeTab === 'custom') {
      const parsedAmount = parseInt(customAmount, 10);
      if (isNaN(parsedAmount) || parsedAmount < 500) {
        setError('Please enter a valid amount of at least ₦500.');
        return;
      }
      paymentAmount = parsedAmount;
    } else {
      paymentAmount = selectedTier.amount;
    }

    setError('');
    setLoading(true);

    try {
      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_placeholder',
        email: email.trim(),
        amount: paymentAmount * 100, // Paystack uses kobo
        currency: activeTab === 'custom' ? 'NGN' : selectedTier.currency,
        ref: `CB-SPONSOR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          custom_fields: [
            { display_name: 'Name', variable_name: 'name', value: name.trim() },
            { display_name: 'Tier', variable_name: 'tier', value: activeTab === 'custom' ? 'Custom' : selectedTier.label },
          ],
        },
        callback: (response: any) => {
          setSuccess(`🎉 Thank you, ${name.split(' ')[0]}! Your ${activeTab === 'custom' ? 'custom payment' : `contribution as a ${selectedTier.label}`} has been received. Reference: ${response.reference}`);
          setEmail('');
          setName('');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setError('Could not open payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="sponsor" className="py-20 bg-gradient-to-b from-transparent via-white/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[var(--color-line)] bg-white font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-coral)]">
            <Heart className="w-3.5 h-3.5" />
            Support Open Education
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-ink)] tracking-tight">
            Keep CuriousBright free for everyone.
          </h2>
          <p className="text-[var(--color-faded-ink)] max-w-xl mx-auto text-base leading-relaxed">
            CuriousBright is free for all students and researchers worldwide. Your sponsorship directly funds servers, storage, and the next set of features.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-mono text-[var(--color-faded-ink)]">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--color-teal)]" />
              25,000+ Learners Served
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--color-mustard)]" />
              Secure Paystack Payments
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-12 flex justify-center mb-6">
            <div className="flex bg-[#F7F6F2] p-1 rounded-md border border-[var(--color-line)]">
              <button 
                className={`px-6 py-2 text-sm font-semibold rounded-sm transition-colors ${activeTab === 'tiers' ? 'bg-white shadow-sm text-[var(--color-ink)]' : 'text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'}`}
                onClick={() => setActiveTab('tiers')}
              >
                Sponsor Tiers
              </button>
              <button 
                className={`px-6 py-2 text-sm font-semibold rounded-sm transition-colors ${activeTab === 'custom' ? 'bg-white shadow-sm text-[var(--color-ink)]' : 'text-[var(--color-faded-ink)] hover:text-[var(--color-ink)]'}`}
                onClick={() => setActiveTab('custom')}
              >
                Custom Payment
              </button>
            </div>
          </div>

          {/* Tier Cards (Only show if tiers tab is active) */}
          {activeTab === 'tiers' && (
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier.id === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`comment-corner-card bg-white p-6 flex flex-col text-left transition-all hover:-translate-y-1 group ${isSelected ? 'ring-2' : ''}`}
                  style={{
                    borderColor: isSelected ? tier.color : undefined,
                    boxShadow: isSelected ? `0 0 0 2px ${tier.color}` : undefined,
                    position: 'relative',
                  }}
                >
                  <div className="comment-corner-ear" />

                  {tier.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-mono text-[10px] font-bold px-3 py-0.5 rounded-full"
                      style={{ background: tier.color }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                    style={{ backgroundColor: tier.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tier.color }} />
                  </div>

                  <div className="font-display font-bold text-lg text-[var(--color-ink)] mb-1">{tier.label}</div>
                  <div className="font-mono text-xs font-semibold mb-4" style={{ color: tier.color }}>{tier.tagline}</div>

                  <ul className="space-y-2 flex-1">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-[var(--color-faded-ink)]">
                        <span className="mt-0.5 text-[10px]" style={{ color: tier.color }}>✓</span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-5 pt-4 border-t text-xs font-mono font-bold"
                    style={{ borderColor: tier.borderColor, color: isSelected ? tier.color : 'var(--color-faded-ink)' }}
                  >
                    {isSelected ? '✓ Selected' : 'Select →'}
                  </div>
                </button>
              );
            })}
          </div>
          )}

          {/* Payment Form */}
          <div className="lg:col-span-5">
            <div className="comment-corner-card bg-white p-7 sm:p-8 shadow-lg sticky top-24">
              <div className="comment-corner-ear" />

              <div className="mb-6">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-faded-ink)] mb-1">
                  {activeTab === 'custom' ? 'Payment Details' : 'Selected Tier'}
                </div>
                {activeTab === 'custom' ? (
                  <div className="text-sm text-[var(--color-ink)] mb-4">
                    You have chosen to make a custom payment. Please enter the details below.
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-sm flex items-center justify-center"
                      style={{ background: selectedTier.bgColor }}
                    >
                      {React.createElement(selectedTier.icon, { className: 'w-4 h-4', style: { color: selectedTier.color } })}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[var(--color-ink)]">{selectedTier.label}</div>
                      <div className="font-mono text-xs" style={{ color: selectedTier.color }}>{selectedTier.tagline}</div>
                    </div>
                  </div>
                )}
              </div>

              {success ? (
                <div className="p-4 rounded-sm text-sm text-[var(--color-ink)] font-medium" style={{ background: 'rgba(0,168,150,0.1)', border: '1px solid rgba(0,168,150,0.3)' }}>
                  {success}
                </div>
              ) : (
                <form onSubmit={handleSponsor} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-faded-ink)] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Amara Okafor"
                      required
                      className="w-full bg-[#F7F6F2] border border-[var(--color-line)] rounded-sm px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-faded-ink)] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amara@university.edu"
                      required
                      className="w-full bg-[#F7F6F2] border border-[var(--color-line)] rounded-sm px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  {activeTab === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-faded-ink)] mb-1.5">
                        Amount (NGN)
                      </label>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        min="500"
                        required
                        className="w-full bg-[#F7F6F2] border border-[var(--color-line)] rounded-sm px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-sm"
                    style={{ justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <span>Opening payment...</span>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        <span>{activeTab === 'custom' ? 'Pay Now' : `Sponsor via Paystack — ${selectedTier.tagline}`}</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-[var(--color-faded-ink)] font-mono pt-1">
                    🔒 Secured by Paystack · Card &amp; Bank Transfer accepted
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
