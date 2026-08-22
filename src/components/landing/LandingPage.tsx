import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ComparisonSection } from './ComparisonSection';
import { FAQSection } from './FAQSection';
import { LandingFooter } from './LandingFooter';
import { Download, Github } from 'lucide-react';
import { GITHUB_REPO, getDownloadUrls } from '../../lib/runtime';

export const LandingPage: React.FC = () => {
  const downloadUrls = getDownloadUrls();

  return (
    <div className="min-h-screen bg-canvas text-zinc-100 font-sans selection:bg-accent selection:text-canvas overflow-x-hidden relative">
      {/* Vertical margin label — editorial device, desktop only */}
      <div
        className="hidden xl:block fixed left-6 top-[45%] text-[11px] font-mono tracking-[0.16em] uppercase text-zinc-600 whitespace-nowrap pointer-events-none z-0"
        style={{ transform: 'rotate(-90deg) translateX(-100%)', transformOrigin: 'top left' }}
      >
        Marlex · Content Factory · Est. 2026
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">
          {/* Wordmark */}
          <div className="flex items-baseline gap-2.5">
            <span className="font-display italic text-xl tracking-tight text-white">
              Marlex<span className="text-accent">.</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 border border-line px-1.5 py-0.5 rounded">
              v2.0
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Возможности
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </nav>

          {/* Quick Studio / Download CTA */}
          <div className="flex items-center gap-2.5">
            <a
              href="/app"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-dark text-canvas font-bold text-xs transition-colors"
            >
              <span>Открыть Studio</span>
            </a>
          </div>
        </div>
      </header>

      {/* Landing Sections */}
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <ComparisonSection />
        <FAQSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
