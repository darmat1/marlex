import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      n: '01',
      title: 'AI держит в голове всю карусель, а не один слайд',
      description:
        'Хук на обложке, доказательства в середине, чёткий призыв в конце. Marlex планирует всю карусель целиком, а не дописывает слайд за слайдом по шаблону.',
      tags: ['Claude Code', 'ChatGPT', 'Gemini CLI', 'Ollama'],
    },
    {
      n: '02',
      title: 'Редактор, где двигается каждый элемент',
      description:
        'Перетаскивайте блоки, выравнивайте стрелками с клавиатуры, меняйте шрифты: системные и Google Fonts. Золотой акцент и лёгкий glass-эффект включены по умолчанию, их можно отключить.',
      tags: ['Google Fonts', '1080×1350 HD', 'Горячие клавиши'],
    },
    {
      n: '03',
      title: 'Один промпт закрывает четыре сети',
      description:
        'Из той же карусели Marlex сразу собирает пост для Telegram, лонгрид для LinkedIn и тред для Threads, а PNG-слайды подходят и для карусели в Instagram. Переписывать вручную не придётся.',
      tags: ['Telegram', 'LinkedIn', 'Threads', 'Instagram'],
    },
    {
      n: '04',
      title: 'Ваши тексты остаются у вас',
      description:
        'Marlex обращается напрямую к CLI, который уже стоит на вашем компьютере: Claude Code, ChatGPT, Gemini или Ollama. Ключи остаются в терминале. Приложению попросту нечего утекать.',
      tags: ['Локальный CLI', 'Без передачи ключей', 'Офлайн режим'],
    },
  ];

  return (
    <section id="features" className="py-24 md:py-28 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 items-end mb-14">
          <span className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-accent">
            Возможности
          </span>
          <p className="font-display font-medium text-[26px] sm:text-[34px] leading-tight text-white">
            Один инструмент вместо ChatGPT, Figma и трёх вкладок с адаптацией текста.
          </p>
        </div>

        <div>
          <hr className="border-line" />
          {features.map((f, i) => (
            <div key={i}>
              <div className="flex gap-8 py-7 px-1 hover:bg-canvas-2 transition-colors -mx-1">
                <div className="font-display italic text-[22px] text-accent w-12 shrink-0">
                  {f.n}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1.3fr] gap-6">
                  <h3 className="text-lg font-bold text-white leading-snug">{f.title}</h3>
                  <div>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-3.5">
                      {f.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded border border-line text-[10.5px] font-mono text-zinc-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <hr className="border-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
