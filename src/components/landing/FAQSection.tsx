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
    <section id="faq" className="py-24 md:py-28">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-accent">
            Вопросы и ответы
          </span>
          <p className="font-display font-medium text-[28px] sm:text-4xl text-white mt-2.5">
            Часто задаваемые вопросы
          </p>
        </div>

        <div>
          <hr className="border-line" />
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 text-left flex items-center justify-between gap-5 cursor-pointer group"
                >
                  <span className="font-semibold text-white text-base sm:text-[17px] group-hover:text-accent transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-accent shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-[14.5px] text-zinc-400 leading-relaxed max-w-[68ch] pb-5 -mt-1.5">
                    {faq.a}
                  </p>
                )}
                <hr className="border-line" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
