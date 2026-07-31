import React from 'react';
import { Building2, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { colors } from '@curious-bright/ui-kit';

export const InstitutionalBanner: React.FC = () => {
  return (
    <section id="institutions" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="comment-corner-card p-8 sm:p-12 text-white overflow-hidden relative"
          style={{ backgroundColor: colors.ink }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[var(--color-mustard)]" />
                For Schools, Universities & Research Labs
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Empower your institution with real-time academic tools.
              </h2>

              <p className="text-white/80 text-base max-w-2xl leading-relaxed">
                Connect entire classrooms, research departments, and peer review networks with single sign-on access, verified faculty badges, and central library curation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-white/90 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-teal)]" />
                  Peer Review & Moderation Portal
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/90 font-medium">
                  <GraduationCap className="w-4 h-4 text-[var(--color-mustard)]" />
                  Free for Non-Profit Education Worldwide
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-center items-start lg:items-end">
              <a 
                href="/apply-institution"
                className="btn-primary bg-white text-[var(--color-ink)] hover:bg-[#F7F6F2] text-sm px-6 py-3.5 w-full sm:w-auto text-center"
              >
                <span>Apply for Institution Account</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="/apply-moderator"
                className="btn-secondary border-white/30 text-white hover:border-white text-sm px-6 py-3.5 w-full sm:w-auto text-center"
              >
                <span>Become a Moderator</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
