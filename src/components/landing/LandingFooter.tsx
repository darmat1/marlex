import React from 'react';
import { Download, Github } from 'lucide-react';
import { GITHUB_REPO, getDownloadUrls } from '../../lib/runtime';

export const LandingFooter: React.FC = () => {
  const downloadUrls = getDownloadUrls();

  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-11 flex flex-wrap items-center justify-between gap-7">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-display italic text-lg text-white">
            Marlex<span className="text-accent">.</span>
          </span>
          <span className="w-px h-5 bg-line" />
          <span className="text-xs text-zinc-500">Local-First Carousel Studio</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6">
          <a
            href={downloadUrls.macSilicon}
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-accent transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> macOS (.dmg)
          </a>
          <a
            href={downloadUrls.windows}
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-accent transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Windows (.exe)
          </a>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-accent transition-colors"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Marlex AI. Сделано для экспертов и креаторов.
        </div>
      </div>
    </footer>
  );
};
