import React from 'react';
import { Sparkles, Download, Github, Heart } from 'lucide-react';
import { GITHUB_REPO, getDownloadUrls } from '../../lib/runtime';

export const LandingFooter: React.FC = () => {
  const downloadUrls = getDownloadUrls();

  return (
    <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-zinc-950 text-base shadow-md">
            M
          </div>
          <div>
            <div className="font-bold text-white text-sm">Marlex Content Factory</div>
            <div className="text-[11px] text-zinc-500">Autonomous Carousel Studio & AI Engine</div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <a
            href={downloadUrls.macSilicon}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> macOS (.dmg)
          </a>
          <a
            href={downloadUrls.windows}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Windows (.exe)
          </a>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>

        {/* Copyright */}
        <div className="text-zinc-500 text-center md:text-right">
          © {new Date().getFullYear()} Marlex AI. Сделано для экспертов и креаторов.
        </div>
      </div>
    </footer>
  );
};
