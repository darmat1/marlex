import React from 'react';
import { XCircle, CheckCircle2, Zap, Clock, DollarSign, Layers } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      metric: 'Время на 1 карусель',
      manual: '3 – 4 часа (написание текста, подбор шрифтов, выравнивание в Figma)',
      marlex: '2 минуты (AI формулирует хуки, стилизует и расставляет акценты)',
    },
    {
      metric: 'Создание постов для других сетей',
      manual: 'Еще 1-2 часа на адаптацию текста под Telegram, LinkedIn и Threads',
      marlex: 'Мгновенно — 1 клик генерирует контент сразу для всех форматов',
    },
    {
      metric: 'Затраты на дизайнера / копирайтера',
      manual: '$500 – $2,000 / месяц или собственное драгоценное время фаундера',
      marlex: '$0 — бесплатное Open-Source приложение на вашем компьютере',
    },
    {
      metric: 'Сложность дизайн-инструментов',
      manual: 'Перегруженные интерфейсы Figma / Photoshop с сотней ненужных кнопок',
      marlex: 'Фокус только на каруселях: умные золотые акценты, плашки, шрифты',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-zinc-950/80 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            Эффективность
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Почему эксперты переходят на Marlex
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="p-8 rounded-3xl bg-red-950/10 border border-red-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Старый ручной способ</h3>
                <p className="text-xs text-zinc-400">Figma + ChatGPT вручную + копирование</p>
              </div>
            </div>

            <div className="space-y-6">
              {comparisons.map((c, idx) => (
                <div key={idx} className="border-t border-zinc-800/60 pt-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    {c.metric}
                  </div>
                  <div className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{c.manual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marlex Way */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 to-amber-950/20 border border-amber-500/30 shadow-2xl relative">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-500 text-zinc-950 text-xs font-black rounded-full uppercase tracking-wider shadow-md">
              В 10 раз быстрее
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Автономный Marlex</h3>
                <p className="text-xs text-amber-400/80 font-medium">Контент-завод 2026</p>
              </div>
            </div>

            <div className="space-y-6">
              {comparisons.map((c, idx) => (
                <div key={idx} className="border-t border-amber-500/20 pt-4">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    {c.metric}
                  </div>
                  <div className="text-sm text-zinc-100 font-medium flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span>{c.marlex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
