import React from 'react';
import { 
  Plus, 
  Trash2, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  Maximize2 
} from 'lucide-react';
import { SlideItem } from '../../types';
import { useMarlexStore } from '../../lib/store/useMarlexStore';

interface SlideEditorProps {
  slide: SlideItem;
  slideIndex: number;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, slideIndex }) => {
  const { updateSlide, deleteSlide, currentResult } = useMarlexStore();
  const [newAccentWord, setNewAccentWord] = React.useState('');

  const handleAddAccent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccentWord.trim()) return;
    const currentAccents = slide.accentWords || [];
    if (!currentAccents.includes(newAccentWord.trim())) {
      updateSlide(slideIndex, {
        accentWords: [...currentAccents, newAccentWord.trim()],
      });
    }
    setNewAccentWord('');
  };

  const handleRemoveAccent = (word: string) => {
    const currentAccents = slide.accentWords || [];
    updateSlide(slideIndex, {
      accentWords: currentAccents.filter((w) => w !== word),
    });
  };

  const handleBodyChange = (idx: number, val: string) => {
    const updated = [...(slide.bodyParagraphs || [])];
    updated[idx] = val;
    updateSlide(slideIndex, { bodyParagraphs: updated });
  };

  const handleAddParagraph = () => {
    const updated = [...(slide.bodyParagraphs || []), 'Новый тезис...'];
    updateSlide(slideIndex, { bodyParagraphs: updated });
  };

  const handleRemoveParagraph = (idx: number) => {
    const updated = (slide.bodyParagraphs || []).filter((_, i) => i !== idx);
    updateSlide(slideIndex, { bodyParagraphs: updated });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl h-full overflow-y-auto">
      {/* Slide Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
            Слайд #{slide.slideNumber}
          </span>
          <select
            value={slide.type}
            onChange={(e) => updateSlide(slideIndex, { type: e.target.value as any })}
            className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
          >
            <option value="cover">Обложка (Cover)</option>
            <option value="content">Контент (Body)</option>
            <option value="final">Финал (CTA)</option>
          </select>
        </div>

        {currentResult && currentResult.slides.length > 1 && (
          <button
            onClick={() => deleteSlide(slideIndex)}
            className="p-1.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
            title="Удалить слайд"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Headline */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Главная мысль / Заголовок (Bold 56–68pt)
        </label>
        <textarea
          rows={2}
          value={slide.headline}
          onChange={(e) => updateSlide(slideIndex, { headline: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 resize-none font-medium"
          placeholder="Заголовок слайда..."
        />
      </div>

      {/* Subheadline */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Подзаголовок (44pt)
        </label>
        <textarea
          rows={2}
          value={slide.subheadline || ''}
          onChange={(e) => updateSlide(slideIndex, { subheadline: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 resize-none"
          placeholder="Дополнительный контекст..."
        />
      </div>

      {/* Body Paragraphs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Тезисы и пункты (40pt)
          </label>
          <button
            onClick={handleAddParagraph}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
          >
            <Plus className="w-3 h-3" /> Добавить пункт
          </button>
        </div>

        {slide.bodyParagraphs && slide.bodyParagraphs.map((para, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            <textarea
              rows={2}
              value={para}
              onChange={(e) => handleBodyChange(idx, e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <button
              onClick={() => handleRemoveParagraph(idx)}
              className="p-1 text-zinc-600 hover:text-red-400 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Accent Keywords Chips */}
      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Tag className="w-3 h-3 text-amber-400" />
          Акцентные слова (золотая плашка):
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          {slide.accentWords && slide.accentWords.map((word, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-400 text-zinc-950 shadow-sm"
            >
              {word}
              <button
                type="button"
                onClick={() => handleRemoveAccent(word)}
                className="hover:text-red-900 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddAccent} className="flex gap-1.5 mt-1">
          <input
            type="text"
            value={newAccentWord}
            onChange={(e) => setNewAccentWord(e.target.value)}
            placeholder="Выделить слово/фразу..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded transition-colors"
          >
            + Добавить
          </button>
        </form>
      </div>

      {/* Swipe Indicator Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-300">
        <span>Показывать стрелку перехода (листай →):</span>
        <input
          type="checkbox"
          checked={slide.showArrow}
          onChange={(e) => updateSlide(slideIndex, { showArrow: e.target.checked })}
          className="rounded accent-amber-500 w-4 h-4"
        />
      </div>
    </div>
  );
};
