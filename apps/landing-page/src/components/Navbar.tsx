import React from 'react';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import websiteLogo from '../assets/website-logo.svg';


export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[var(--color-line)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
              <img src={websiteLogo} alt="Curious Bright" style={{ height: 36, width: 'auto' }} />
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
