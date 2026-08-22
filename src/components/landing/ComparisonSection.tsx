import React from 'react';

export const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      metric: 'Время на 1 карусель',
      manual: '3–4 часа (написание текста, подбор шрифтов, выравнивание в Figma)',
      marlex: '2 минуты (AI формулирует хуки, стилизует и расставляет акценты)',
    },
    {
      metric: 'Посты для других сетей',
      manual: 'Еще 1–2 часа на адаптацию текста под Telegram, LinkedIn и Threads',
      marlex: 'Один клик генерирует контент сразу для всех форматов',
    },
    {
      metric: 'Дизайнер / копирайтер',
      manual: '$500–2000 / месяц или собственное драгоценное время фаундера',
      marlex: '$0: бесплатное Open-Source приложение на вашем компьютере',
    },
    {
      metric: 'Сложность инструментов',
      manual: 'Перегруженные интерфейсы Figma / Photoshop с сотней ненужных кнопок',
      marlex: 'Только то, что нужно для карусели: акценты, плашки, шрифты. Без панели на 200 кнопок',
    },
  ];

  return (
    <section className="py-24 md:py-28 border-t border-b border-line bg-canvas-2">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 items-end mb-12">
          <span className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-accent">
            Эффективность
          </span>
          <p className="font-display font-medium text-[26px] sm:text-[34px] leading-tight text-white">
            Что меняется на практике.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border border-line rounded-lg overflow-hidden">
          <div className="p-6 border-b border-line">
            <div className="text-[15px] font-bold text-zinc-400">Как раньше</div>
            <div className="text-[11.5px] text-zinc-600 mt-0.5">
              Figma + ChatGPT вручную + копирование
            </div>
          </div>
          <div className="p-6 border-b border-line border-t md:border-t-0 md:border-l border-line bg-accent/[0.06]">
            <div className="text-[15px] font-bold text-white">С Marlex</div>
            <div className="text-[11.5px] text-accent font-semibold mt-0.5">
              От промпта до экспорта
            </div>
          </div>

          {comparisons.map((c, idx) => (
            <React.Fragment key={idx}>
              <div className="p-6 border-b border-line last:border-b-0 md:last:border-b">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-600 mb-1.5">
                  {c.metric}
                </div>
                <div className="text-[13.5px] leading-relaxed text-zinc-400">{c.manual}</div>
              </div>
              <div className="p-6 border-b md:border-l border-line last:border-b-0 bg-accent/[0.06]">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-accent mb-1.5">
                  {c.metric}
                </div>
                <div className="text-[13.5px] leading-relaxed text-zinc-100 font-medium">
                  {c.marlex}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
