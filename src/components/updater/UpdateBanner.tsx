import React, { useState, useEffect } from 'react';
import { Sparkles, Download, X, ArrowRight } from 'lucide-react';
import { AppUpdateInfo } from '../../types';
import { checkAppUpdate, openDownloadUrl } from '../../lib/updater';
import { UpdateModal } from './UpdateModal';

export const UpdateBanner: React.FC = () => {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check update on mount
    checkAppUpdate().then((info) => {
      if (info && info.hasUpdate) {
        setUpdate(info);
      }
    });
  }, []);

  if (!update || !update.hasUpdate || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-zinc-100 z-40 relative select-none">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-400">
            Доступна новая версия Marlex v{update.latestVersion}
          </span>
          <span className="text-zinc-400 hidden sm:inline">
            (у вас установлена v{update.currentVersion})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] text-amber-300 hover:text-white underline underline-offset-2 mr-2 cursor-pointer font-medium"
          >
            Что нового?
          </button>
          <button
            onClick={() => openDownloadUrl(update.downloadUrl)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Обновить</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors ml-1"
            title="Закрыть уведомление"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <UpdateModal
        update={update}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
