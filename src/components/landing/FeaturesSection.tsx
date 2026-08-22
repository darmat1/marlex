import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Share2, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Zap, 
  Check, 
  Terminal 
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Смысловые AI-карусели за 2 секунды',
      description:
        'Marlex не просто генерирует текст — он строит драматургию карусели: цепляющий хук-обложку, инсайты с акцентами и сильный CTA.',
      tags: ['Claude Code', 'ChatGPT', 'Gemini CLI', 'Ollama'],
    },
    {
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      title: 'Студия уровня Canva & Figma',
      description:
        'Свободное перемещение элементов, стрелочки с клавиатуры, поддержка системных и Google Fonts, стеклянный морфизм и умные золотые акценты.',
      tags: ['Google Fonts', '1080x1350 HD', 'Glassmorphism', 'Горячие клавиши'],
    },
    {
      icon: <Share2 className="w-6 h-6 text-amber-400" />,
      title: 'Контент-завод для 4 соцсетей сразу',
      description:
        'Один промпт создает не только слайды, но и готовые посты для Telegram, профессиональные лонгриды для LinkedIn и треды для Threads/X.',
      tags: ['Telegram', 'LinkedIn', 'Threads', 'Instagram'],
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: '100% Приватность и Безопасность',
      description:
        'Никаких утечек API-ключей. Marlex умеет работать напрямую через ваши установленные терминальные CLI утилиты (Claude, ChatGPT, Gemini, Ollama) на Mac/PC.',
      tags: ['Локальный CLI', 'Без передачи ключей', 'Офлайн режим'],
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            Возможности Marlex
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Всё, что нужно для создания контента топ-уровня в одной экосистеме
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/90 transition-all duration-300 group shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                {f.title}
              </h3>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {f.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {f.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
