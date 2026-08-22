import React, { useState } from 'react';
import { 
  Download, 
  Sparkles, 
  Apple, 
  Monitor, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Layers, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';
import { getClientPlatform, getDownloadUrls, GITHUB_REPO } from '../../lib/runtime';

export const HeroSection: React.FC = () => {
  const platform = getClientPlatform();
  const downloadUrls = getDownloadUrls();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getPrimaryDownload = () => {
    if (platform === 'windows') {
      return {
        label: 'Скачать для Windows',
        sub: 'Windows 10 / 11 (.exe)',
        icon: <Monitor className="w-5 h-5" />,
        url: downloadUrls.windows,
      };
    }
    // Default to macOS Apple Silicon
    return {
      label: 'Скачать для macOS',
      sub: 'Apple Silicon M1/M2/M3/M4 (.dmg)',
      icon: <Apple className="w-5 h-5" />,
      url: downloadUrls.macSilicon,
    };
  };

  const primary = getPrimaryDownload();

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Marlex Desktop 2.0 • Content Factory</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Создавайте вирусные карусели <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            за 2 минуты, а не 3 часа
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed font-normal">
          Автономное десктопное приложение для экспертов и фаундеров. Генерация смысловых слайдов через локальный AI (Claude, ChatGPT, Gemini, Ollama), встроенная студия дизайна уровня Canva/Figma и экспорт в Telegram, LinkedIn и Threads.
        </p>

        {/* Action Button & OS Selection */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="relative inline-flex flex-col items-center">
            <div className="inline-flex rounded-2xl shadow-xl shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 p-[1px]">
              <a
                href={primary.url}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base sm:text-lg transition-all transform active:scale-98"
              >
                <Download className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
                <div className="text-left">
                  <div>{primary.label}</div>
                  <div className="text-[11px] font-medium text-zinc-900/80 -mt-0.5">{primary.sub}</div>
                </div>
              </a>

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 border-l border-amber-600/40 hover:bg-amber-400/20 rounded-r-2xl text-zinc-950 transition-colors"
                title="Выбрать другую версию ОС"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 py-1.5">
                  Все версии дистрибутива:
                </div>
                
                <a
                  href={downloadUrls.macSilicon}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Apple className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="font-semibold">macOS (Apple Silicon)</div>
                    <div className="text-[10px] text-zinc-500">M1 / M2 / M3 / M4 (.dmg)</div>
                  </div>
                </a>

                <a
                  href={downloadUrls.macIntel}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Apple className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="font-semibold">macOS (Intel)</div>
                    <div className="text-[10px] text-zinc-500">x64 (.dmg)</div>
                  </div>
                </a>

                <a
                  href={downloadUrls.windows}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Monitor className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="font-semibold">Windows</div>
                    <div className="text-[10px] text-zinc-500">64-bit Installer (.exe)</div>
                  </div>
                </a>

                <div className="border-t border-zinc-800 my-1 pt-1">
                  <a
                    href={downloadUrls.releasesPage}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  >
                    <span>Все релизы на GitHub</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-sm font-semibold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Open-Source & GitHub</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-400 mb-14">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Бесплатно и без подписок
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Локальная безопасность данных
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Работает с Claude, ChatGPT, Ollama
          </span>
        </div>

        {/* Interactive App Mockup Preview */}
        <div className="relative mx-auto max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-zinc-700/50 via-zinc-800/20 to-zinc-900/50 border border-zinc-700/60 shadow-2xl shadow-black/80">
          <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative">
            {/* macOS Window Header */}
            <div className="h-9 bg-zinc-900/90 border-b border-zinc-800 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[11px] font-mono text-zinc-400 font-medium">
                Marlex Studio — Автономная дизайн-система
              </div>
              <div className="w-12" />
            </div>

            {/* Studio Screenshot & Interactive Elements */}
            <div className="p-6 md:p-8 bg-zinc-950/90 flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Left Panel Teaser */}
              <div className="w-full md:w-64 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" /> Промпт для AI
                  </span>
                </div>
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs text-zinc-300 font-medium leading-relaxed">
                  "8 слайдов о том, как AI меняет правила стартапов в 2026 году..."
                </div>
                <div className="py-2.5 px-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-400 font-semibold flex items-center justify-between">
                  <span>Генерация 8 слайдов</span>
                  <span className="font-mono">1.8s</span>
                </div>
              </div>

              {/* Center Carousel Card Mockup */}
              <div className="relative w-64 sm:w-72 aspect-[4/5] rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-amber-500/30"
                style={{
                  background: 'linear-gradient(145deg, #9B6140 0%, #683E28 100%)',
                }}
              >
                <div className="flex justify-between items-center text-xs font-semibold text-white/80">
                  <span className="tracking-wide">@marlex.expert</span>
                  <span className="font-mono">01 / 08</span>
                </div>

                <div className="space-y-3 my-auto">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    AI <span className="bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded">не убьёт</span> стартапы.
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Он изменит правила игры. И вот что будет происходить дальше.
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-white/70">
                  <span>Marlex Creator</span>
                  <span className="px-2.5 py-1 bg-black/40 rounded-full font-bold text-amber-300 border border-amber-400/20">
                    листай →
                  </span>
                </div>
              </div>

              {/* Right Properties Inspector Teaser */}
              <div className="w-full md:w-64 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 text-left space-y-3">
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Инспектор стилей
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Шрифт</span>
                    <span className="text-zinc-200 font-semibold">Source Sans 3</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Золотые акценты</span>
                    <span className="text-amber-400 font-bold">Активны</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Соцсети</span>
                    <span className="text-emerald-400 font-medium">TG + LinkedIn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
