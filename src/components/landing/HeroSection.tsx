import React, { useState } from 'react';
import {
  Download,
  Apple,
  Monitor,
  Tablet,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { getClientPlatform, getDownloadUrls, GITHUB_REPO } from '../../lib/runtime';

export const HeroSection: React.FC = () => {
  const platform = getClientPlatform();
  const downloadUrls = getDownloadUrls();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedMacCmd, setCopiedMacCmd] = useState(false);

  const getPrimaryDownload = () => {
    if (platform === 'ipad' || platform === 'ios') {
      return {
        label: 'Открыть на iPad (PWA)',
        sub: 'Веб-приложение для Safari / Chrome',
        icon: <Tablet className="w-4 h-4" />,
        url: '/app',
      };
    }
    if (platform === 'windows') {
      return {
        label: 'Скачать для Windows',
        sub: 'Windows 10 / 11 (.exe)',
        icon: <Monitor className="w-4 h-4" />,
        url: downloadUrls.windows,
      };
    }
    // Default to macOS Apple Silicon
    return {
      label: 'Скачать для macOS',
      sub: 'Apple Silicon M1/M2/M3/M4 (.dmg)',
      icon: <Apple className="w-4 h-4" />,
      url: downloadUrls.macSilicon,
    };
  };

  const primary = getPrimaryDownload();

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
            {/* Text column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-px bg-accent" />
                <span className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-accent">
                  Marlex Desktop 2.0 · Content Factory
                </span>
              </div>

              <h1 className="font-display font-medium text-[38px] sm:text-5xl lg:text-6xl leading-[1.06] tracking-tight text-white mb-6">
                Один промпт. Карусель,<br />
                которую <em className="text-accent">дочитывают</em> до конца
              </h1>

              <p className="max-w-[46ch] text-lg text-zinc-400 mb-9 leading-relaxed">
                Marlex пишет хук, инсайты и призыв к действию через ваш локальный Claude, ChatGPT,
                Gemini или Ollama, раскладывает текст по слайдам во встроенном редакторе. На
                выходе: PNG и PDF для LinkedIn и Instagram, плюс готовые тексты для Telegram и Threads.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <div className="relative inline-flex">
                  <a
                    href={primary.url}
                    className="flex items-center gap-3 pl-6 pr-5 py-4 rounded-l-md bg-accent hover:bg-accent-dark text-canvas font-semibold text-[15px] transition-colors"
                  >
                    <Download className="w-[17px] h-[17px]" />
                    <span>
                      <span className="block">{primary.label}</span>
                      <span className="block text-[10.5px] font-medium opacity-75 -mt-0.5">
                        {primary.sub}
                      </span>
                    </span>
                  </a>

                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-3.5 rounded-r-md bg-accent hover:bg-accent-dark border-l border-black/20 text-canvas transition-colors"
                    title="Выбрать другую версию ОС"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-72 bg-canvas-3 border border-line rounded-lg shadow-2xl p-1.5 z-50 text-left">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 py-1.5">
                        Все версии дистрибутива
                      </div>

                      <a
                        href={downloadUrls.macSilicon}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-zinc-200 hover:bg-canvas-2 hover:text-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Apple className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="font-semibold">macOS (Apple Silicon)</div>
                          <div className="text-[10px] text-zinc-500">M1 / M2 / M3 / M4 (.dmg)</div>
                        </div>
                      </a>

                      <a
                        href={downloadUrls.macIntel}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-zinc-200 hover:bg-canvas-2 hover:text-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Apple className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="font-semibold">macOS (Intel)</div>
                          <div className="text-[10px] text-zinc-500">x64 (.dmg)</div>
                        </div>
                      </a>

                      <a
                        href={downloadUrls.windows}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-zinc-200 hover:bg-canvas-2 hover:text-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Monitor className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="font-semibold">Windows</div>
                          <div className="text-[10px] text-zinc-500">64-bit Installer (.exe)</div>
                        </div>
                      </a>

                      <a
                        href="/app"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-zinc-200 hover:bg-canvas-2 hover:text-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Tablet className="w-4 h-4 text-accent" />
                        <div>
                          <div className="font-semibold text-accent">iPad / Web App (PWA)</div>
                          <div className="text-[10px] text-zinc-400">Открыть онлайн без скачивания</div>
                        </div>
                      </a>

                      <div className="border-t border-line my-1 pt-1">
                        <a
                          href={downloadUrls.releasesPage}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] text-zinc-500 hover:text-zinc-200 hover:bg-canvas-2/50"
                        >
                          <span>Все релизы на GitHub</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="/app"
                  className="flex items-center gap-2.5 px-5 py-4 rounded-md border border-accent/40 bg-accent/5 hover:bg-accent/10 hover:border-accent text-accent text-sm font-semibold transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Веб-версия / iPad</span>
                </a>

                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-5 py-4 rounded-md border border-line hover:border-accent text-zinc-300 hover:text-accent text-sm font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>

              {/* macOS Gatekeeper helper note with 1-click copy */}
              <div className="mb-6 p-3 rounded-lg bg-canvas-2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Apple className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>
                    Если macOS блокирует первый запуск: <code className="bg-canvas-3 px-1.5 py-0.5 rounded text-accent font-mono text-[11.5px]">xattr -cr /Applications/Marlex.app</code>
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('xattr -cr /Applications/Marlex.app');
                    setCopiedMacCmd(true);
                    setTimeout(() => setCopiedMacCmd(false), 2000);
                  }}
                  className="self-start sm:self-auto px-2.5 py-1 rounded bg-canvas-3 hover:bg-line text-[11px] text-zinc-300 hover:text-white shrink-0 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedMacCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMacCmd ? 'Скопировано' : 'Скопировать команду'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-zinc-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  Бесплатно, без подписки
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  Тексты не покидают ваш компьютер
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  Работает через Claude, ChatGPT, Ollama
                </span>
              </div>
            </div>

            {/* Visual column — offset, rotated carousel mockup */}
            <div className="relative flex justify-center py-5">
              <div
                className="absolute w-[250px] aspect-[4/5] bg-canvas-3 border border-line rounded-lg"
                style={{ transform: 'rotate(6deg) translate(18px, 22px)' }}
              />

              <div
                className="relative w-[270px] aspect-[4/5] rounded-lg p-6 flex flex-col justify-between shadow-2xl shadow-black/70"
                style={{
                  transform: 'rotate(-4deg)',
                  background: 'linear-gradient(155deg, color-mix(in oklch, var(--color-accent) 88%, white) 0%, color-mix(in oklch, var(--color-accent) 55%, black) 100%)',
                }}
              >
                <div className="flex justify-between items-center text-[11px] font-semibold text-black/65">
                  <span>@marlex.expert</span>
                  <span className="font-mono">01 / 08</span>
                </div>

                <div>
                  <h3 className="font-display font-medium text-2xl leading-tight text-black/85 mb-2.5">
                    Длинные посты никто не дочитывает.
                  </h3>
                  <p className="text-xs leading-relaxed text-black/65">
                    Карусель читают до последнего слайда.
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10.5px] font-bold text-black/55">
                  <span>Marlex Creator</span>
                  <span>листай →</span>
                </div>
              </div>

              <div className="absolute bottom-1.5 right-2 bg-canvas-3 border border-line rounded-md px-3.5 py-2.5 shadow-xl">
                <div className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5">
                  Генерация 8 слайдов
                </div>
                <div className="text-accent font-bold font-mono text-[13px]">1.8s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ledger strip — condensed proof, pulled from the comparison numbers below */}
      <section className="border-y border-line bg-canvas-2">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-7 flex flex-col sm:flex-row gap-7 sm:gap-12">
          <div className="border-t sm:border-t-0 sm:border-l border-line pt-4 sm:pt-0 sm:pl-5 first:border-t-0 first:pt-0">
            <div className="font-display text-2xl text-white">
              3–4 ч <span className="text-zinc-600 text-base">→</span>{' '}
              <span className="text-accent">2 мин</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">на одну карусель</div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-line pt-4 sm:pt-0 sm:pl-5">
            <div className="font-display text-2xl text-white">
              $500–2000 <span className="text-zinc-600 text-base">→</span>{' '}
              <span className="text-accent">$0</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">не дизайнеру и не копирайтеру</div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-line pt-4 sm:pt-0 sm:pl-5">
            <div className="font-display text-2xl text-white">
              4 сети <span className="text-accent text-lg">из одной карусели</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">Telegram, LinkedIn, Threads, Instagram</div>
          </div>
        </div>
      </section>
    </>
  );
};
