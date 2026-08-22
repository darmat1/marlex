import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ComparisonSection } from './ComparisonSection';
import { FAQSection } from './FAQSection';
import { LandingFooter } from './LandingFooter';
import { Download, Github, Sparkles } from 'lucide-react';
import { GITHUB_REPO, getDownloadUrls } from '../../lib/runtime';

export const LandingPage: React.FC = () => {
  const downloadUrls = getDownloadUrls();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 overflow-x-hidden">
      {/* Top Floating Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-zinc-950 text-lg shadow-lg shadow-amber-500/20">
              M
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-base">MARLEX</span>
              <span className="text-[10px] font-mono text-amber-400 ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                v2.0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-amber-400 transition-colors">
              Возможности
            </a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">
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

          {/* Quick Download CTA */}
          <div className="flex items-center gap-3">
            <a
              href={downloadUrls.macSilicon}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/15 transition-all transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Скачать приложение</span>
            </a>
          </div>
        </div>
      </header>

      {/* Landing Sections */}
      <main>
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
