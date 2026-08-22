import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Нужны ли платные API-ключи для работы с AI?',
      a: 'Нет! Marlex поддерживает режим Local CLI. Если на вашем компьютере установлен Claude Code, ChatGPT CLI, Gemini CLI или Ollama, Marlex работает через них напрямую без оплаты API-токенов.',
    },
    {
      q: 'На каких операционных системах работает Marlex?',
      a: 'Marlex полностью оптимизирован для macOS (как Apple Silicon M1/M2/M3/M4, так и Intel) и Windows 10/11 (64-bit).',
    },
    {
      q: 'Как работает система обновлений?',
      a: 'Приложение проверяет наличие новых версий через официальные релизы GitHub. Когда выходит обновление, в приложении появляется уведомление, и вы можете обновиться в 1 клик.',
    },
    {
      q: 'В каком формате экспортируются карусели?',
      a: 'Вы можете экспортировать карусель в виде набора отдельных Ultra-HD PNG картинок (1080x1350 px), готового PDF-документа для документов LinkedIn, а также скопировать тексты для Telegram и Threads в один клик.',
    },
    {
      q: 'Где хранятся мои данные и проекты?',
      a: 'Все данные и история ваших каруселей хранятся локально на вашем компьютере. Мы не передаем и не сохраняем ваши тексты на сторонних серверах.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            Вопросы и ответы
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Часто задаваемые вопросы
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-white text-base sm:text-lg">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
