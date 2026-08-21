import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderGit2, 
  Layers, 
  FileText, 
  Download, 
  ChevronDown, 
  Image as ImageIcon,
  LogOut,
  Settings,
  Users,
  Check,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { exportSlidesToZip, exportSlidesToPdf } from '../../lib/canvas/export-utils';
import { signOut } from '../../lib/auth-client';
import { ModelSelectorDropdown } from './ModelSelectorDropdown';
import { ProjectSettingsModal } from '../projects/ProjectSettingsModal';

interface HeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  } | null;
  onOpenSettings: () => void;
  activeTab: 'studio' | 'channels' | 'history';
  setActiveTab: (tab: 'studio' | 'channels' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user,
  onOpenSettings, 
  activeTab, 
  setActiveTab 
}) => {
  const { 
    activeProject, 
    activeProfile, 
    currentResult, 
    bgPhotoUrl 
  } = useMarlexStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportZip = async () => {
    if (!currentResult) return;
    setIsExportMenuOpen(false);
    setIsExporting(true);
    try {
      let bgImg: HTMLImageElement | null = null;
      if (bgPhotoUrl) {
        bgImg = new Image();
        bgImg.src = bgPhotoUrl;
        await new Promise((res) => { bgImg!.onload = res; bgImg!.onerror = res; });
      }
      const zipBlob = await exportSlidesToZip(
        currentResult.slides, 
        activeProfile, 
        currentResult.title || activeProject.name || 'marlex_carousel',
        bgImg
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResult.title || 'carousel'}_1080x1350_PNG.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Ошибка экспорта ZIP: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentResult) return;
    setIsExportMenuOpen(false);
    setIsExporting(true);
    try {
      let bgImg: HTMLImageElement | null = null;
      if (bgPhotoUrl) {
        bgImg = new Image();
        bgImg.src = bgPhotoUrl;
        await new Promise((res) => { bgImg!.onload = res; bgImg!.onerror = res; });
      }
      const pdfBlob = await exportSlidesToPdf(currentResult.slides, activeProfile, bgImg);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResult.title || activeProject.name || 'carousel'}_LinkedIn.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Ошибка экспорта PDF: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      <header className="h-12 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl pl-20 pr-3 flex items-center justify-between select-none z-30 app-drag">
        {/* 1. LEFT ZONE: Brand Logo & Project Pill */}
        <div className="flex items-center gap-2 app-no-drag">
          <div className="flex items-center gap-2">
            <img src="./icon.svg" alt="Marlex" className="w-6 h-6 rounded-lg shadow-sm" />
            <span className="font-black tracking-tight text-white text-sm">MARLEX</span>
          </div>

          <span className="text-zinc-700 mx-1">/</span>

          {/* Project & Team Dropdown Pill */}
          <button
            onClick={() => setIsProjectSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-800/60"
            title="Настройки проекта и команда"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProject.bgColor || '#9B6140' }} />
            <span className="font-semibold max-w-[140px] truncate">{activeProject.name}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>
        </div>

        {/* 2. CENTER ZONE: Segmented View Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800/80 app-no-drag">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'studio' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Слайды
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'channels' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Тексты
          </button>
        </div>

        {/* 3. RIGHT ZONE: Model, Export & User */}
        <div className="flex items-center gap-2 app-no-drag">
          {/* AI Model Selector */}
          <ModelSelectorDropdown onOpenExecutionSettings={onOpenSettings} />

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={isExporting || !currentResult}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Экспорт...' : 'Экспорт'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-1 backdrop-blur-xl">
                <button
                  onClick={handleExportZip}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-200 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-zinc-100">Instagram ZIP (PNG)</div>
                    <div className="text-[10px] text-zinc-500">1080 × 1350 px в архиве</div>
                  </div>
                </button>

                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-zinc-100">LinkedIn PDF Документ</div>
                    <div className="text-[10px] text-zinc-500">Многостраничный PDF</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-[11px] hover:border-amber-400 transition-colors cursor-pointer"
                title={user.name || user.email}
              >
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-1 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <div className="font-semibold text-xs text-zinc-200 truncate">{user.name || 'Пользователь'}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProjectSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Проект и команда</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Настройки AI моделей</span>
                  </button>

                  <div className="border-t border-zinc-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/15 text-left text-xs text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Выйти из аккаунта</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Project & Team Settings Modal */}
      <ProjectSettingsModal
        isOpen={isProjectSettingsOpen}
        onClose={() => setIsProjectSettingsOpen(false)}
      />
    </>
  );
};
