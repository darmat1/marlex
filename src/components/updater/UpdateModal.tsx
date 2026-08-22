import React from 'react';
import { Sparkles, Download, X, ExternalLink, ArrowRight } from 'lucide-react';
import { AppUpdateInfo } from '../../types';
import { openDownloadUrl } from '../../lib/updater';

interface UpdateModalProps {
  update: AppUpdateInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ update, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Доступна новая версия Marlex</h3>
              <div className="text-xs text-amber-400/90 font-mono">
                v{update.currentVersion} → <span className="font-bold">v{update.latestVersion}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Release Notes Body */}
        <div className="p-6 max-h-72 overflow-y-auto space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Что нового в выпуске {update.releaseName || `v${update.latestVersion}`}:
          </div>
          {update.releaseNotes ? (
            <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl font-mono">
              {update.releaseNotes}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">
              Улучшения производительности, исправления и новые функции каруселей.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between gap-3">
          <button
            onClick={() => openDownloadUrl(update.htmlUrl)}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-zinc-900 transition-colors"
          >
            <span>Релиз на GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Позже
            </button>
            <button
              onClick={() => {
                openDownloadUrl(update.downloadUrl);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Обновить в 1 клик</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
