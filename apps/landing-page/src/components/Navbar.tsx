import React from 'react';
import { BookOpen, Users, ArrowRight, Sparkles } from 'lucide-react';
import { colors } from '@curious-bright/ui-kit';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[var(--color-line)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div 
                className="w-10 h-10 rounded-sm flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform"
                style={{ backgroundColor: colors.ink }}
              >
                <BookOpen className="w-5 h-5 text-[#F7F6F2]" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-[var(--color-ink)]">
                Curious Bright
              </span>
            </a>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium border border-[var(--color-line)] bg-white text-[var(--color-faded-ink)]">
              <Sparkles className="w-3 h-3 text-[var(--color-coral)]" />
              SHARED RESEARCH NOTEBOOK
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-sm font-medium text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-[var(--color-coral)]" />
              Work Together
            </a>
            <a 
              href="#sandbox" 
              className="text-sm font-medium text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors"
            >
              Live Playground
            </a>
            <a 
              href="#institutions" 
              className="text-sm font-medium text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors"
            >
              For Schools & Labs
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a 
              href="https://app.curiousbright.com.ng/login"
              className="btn-secondary hidden sm:inline-flex text-xs px-4 py-2"
            >
              Sign In
            </a>
            <a 
              href="https://app.curiousbright.com.ng/register" 
              className="btn-primary text-xs px-4 py-2"
            >
              <span>Join Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
