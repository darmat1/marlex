import React, { useState } from 'react';
import { 
  Type, 
  Square, 
  Tag, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Layout, 
  Circle, 
  Minus, 
  Quote, 
  Sun, 
  Sliders, 
  Bookmark, 
  Hash, 
  Columns,
  Layers
} from 'lucide-react';
import { CanvasElement, ShapeType } from '../../types';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { DEFAULT_ACCENT_COLOR } from '../../lib/constants';

interface CanvaElementPaletteProps {
  onAddElement: (element: CanvasElement) => void;
}

type ElementCategory = 'text' | 'shapes' | 'decor' | 'headers';

export const CanvaElementPalette: React.FC<CanvaElementPaletteProps> = ({ onAddElement }) => {
  const [activeCategory, setActiveCategory] = useState<ElementCategory>('text');
  const { activeProfile, activeProject } = useMarlexStore();

  const accentColor = activeProject.accentColor || DEFAULT_ACCENT_COLOR;

  // 1. Text Elements
  const addHeading = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 400,
      width: 920,
      text: 'Новый крупный заголовок',
      fontSize: 58,
      fontWeight: 800,
      color: '#FFFFFF',
      textAlign: 'left',
      zIndex: 30,
    });
  };

  const addSubheading = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 500,
      width: 920,
      text: 'Поясняющий подзаголовок или мысль...',
      fontSize: 42,
      fontWeight: 500,
      color: 'rgba(255, 255, 255, 0.95)',
      textAlign: 'left',
      zIndex: 30,
    });
  };

  const addBodyCard = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 620,
      width: 920,
      height: 100,
      text: 'Текст пункта или тезиса внутри карточки...',
      fontSize: 38,
      fontWeight: 400,
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.55)',
      borderRadius: 18,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      backdropBlur: true,
      textAlign: 'left',
      zIndex: 30,
    });
  };

  const addQuoteBox = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 580,
      width: 920,
      height: 120,
      text: '«Главное — не инструмент, а ценность, которую вы создаете для клиента.»',
      fontSize: 38,
      fontWeight: 600,
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 16,
      borderColor: accentColor,
      borderWidth: 3,
      textAlign: 'left',
      zIndex: 30,
    });
  };

  const addTagBadge = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'badge',
      x: 80,
      y: 320,
      width: 220,
      height: 52,
      text: '#ТРЕНДЫ 2026',
      fontSize: 26,
      fontWeight: 800,
      color: accentColor,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 999,
      borderColor: `${accentColor}40`,
      borderWidth: 1,
      zIndex: 30,
    });
  };

  // 2. Geometric Shapes
  const addGlassCard = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'glass_card',
      x: 60,
      y: 420,
      width: 960,
      height: 480,
      bgColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 24,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1.5,
      backdropBlur: true,
      zIndex: 15,
    });
  };

  const addSolidRectangle = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'rectangle',
      x: 80,
      y: 500,
      width: 920,
      height: 240,
      bgColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 18,
      zIndex: 15,
    });
  };

  const addCircle = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'circle',
      x: 440,
      y: 400,
      width: 200,
      height: 200,
      bgColor: `${accentColor}25`,
      borderColor: accentColor,
      borderWidth: 2,
      borderRadius: 999,
      zIndex: 20,
    });
  };

  const addAccentLine = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'line',
      x: 80,
      y: 480,
      width: 200,
      height: 6,
      bgColor: accentColor,
      borderRadius: 999,
      zIndex: 30,
    });
  };

  const addDivider = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'divider',
      x: 80,
      y: 600,
      width: 920,
      height: 2,
      bgColor: 'rgba(255, 255, 255, 0.2)',
      zIndex: 25,
    });
  };

  // 3. Ornaments & Decorations
  const addSparkles = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 340,
      width: 140,
      text: '✨ ⭐ ✨',
      fontSize: 48,
      color: accentColor,
      textAlign: 'left',
      zIndex: 35,
    });
  };

  const addGlowOrb = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'glow_orb',
      x: 300,
      y: 200,
      width: 480,
      height: 480,
      bgColor: `${accentColor}35`,
      borderRadius: 999,
      opacity: 70,
      zIndex: 10,
    });
  };

  const addVignetteBottom = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'vignette_bottom',
      x: 0,
      y: 650,
      width: 1080,
      height: 700,
      bgColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 12,
    });
  };

  const addCornerDecor = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'shape',
      shapeType: 'corner_decor',
      x: 60,
      y: 60,
      width: 80,
      height: 80,
      borderColor: accentColor,
      borderWidth: 3,
      zIndex: 30,
    });
  };

  // 4. Headers & Footers (Колонтитулы)
  const addBrandHeader = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 80,
      y: 80,
      width: 500,
      text: activeProject.brandHandle || '@marlex.expert',
      fontSize: 34,
      fontWeight: 700,
      color: '#FFFFFF',
      textAlign: 'left',
      zIndex: 30,
    });
  };

  const addSlideCounter = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'text',
      x: 820,
      y: 80,
      width: 180,
      text: '01 / 08',
      fontSize: 28,
      fontWeight: 600,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'right',
      zIndex: 30,
    });
  };

  const addSwipeButton = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'badge',
      x: 780,
      y: 1220,
      width: 220,
      height: 60,
      text: 'листай  →',
      fontSize: 32,
      fontWeight: 800,
      color: accentColor,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 999,
      borderColor: `${accentColor}40`,
      borderWidth: 1,
      zIndex: 30,
    });
  };

  const addSaveButton = () => {
    onAddElement({
      id: `elem_${Date.now()}`,
      type: 'badge',
      x: 760,
      y: 1220,
      width: 240,
      height: 60,
      text: 'сохрани  🏷️',
      fontSize: 32,
      fontWeight: 800,
      color: accentColor,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 999,
      borderColor: `${accentColor}40`,
      borderWidth: 1,
      zIndex: 30,
    });
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs select-none">
      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
        <button
          onClick={() => setActiveCategory('text')}
          className={`py-1 rounded font-semibold text-[10px] transition-all cursor-pointer ${
            activeCategory === 'text'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Текст
        </button>
        <button
          onClick={() => setActiveCategory('shapes')}
          className={`py-1 rounded font-semibold text-[10px] transition-all cursor-pointer ${
            activeCategory === 'shapes'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Фигуры
        </button>
        <button
          onClick={() => setActiveCategory('decor')}
          className={`py-1 rounded font-semibold text-[10px] transition-all cursor-pointer ${
            activeCategory === 'decor'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Декор
        </button>
        <button
          onClick={() => setActiveCategory('headers')}
          className={`py-1 rounded font-semibold text-[10px] transition-all cursor-pointer ${
            activeCategory === 'headers'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Шапка
        </button>
      </div>

      {/* 1. TEXT CATEGORY */}
      {activeCategory === 'text' && (
        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-100">
          <button
            onClick={addHeading}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-extrabold text-sm text-zinc-100 group-hover:text-amber-400">H1 Заголовок</span>
            <span className="text-[10px] text-zinc-500">Крупный хук 58pt</span>
          </button>

          <button
            onClick={addSubheading}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">H2 Подзаголовок</span>
            <span className="text-[10px] text-zinc-500">Пояснение 42pt</span>
          </button>

          <button
            onClick={addBodyCard}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-medium text-xs text-zinc-200 group-hover:text-amber-400">Карточка тезиса</span>
            <span className="text-[10px] text-zinc-500">Матовая плашка</span>
          </button>

          <button
            onClick={addQuoteBox}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-medium text-xs text-zinc-200 group-hover:text-amber-400">Цитатный блок</span>
            <span className="text-[10px] text-zinc-500">Золотая рамка</span>
          </button>

          <button
            onClick={addTagBadge}
            className="col-span-2 p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-amber-400"># Тэг-бейдж</span>
            <span className="text-[10px] text-zinc-500">Категория / Тема</span>
          </button>
        </div>
      )}

      {/* 2. SHAPES CATEGORY */}
      {activeCategory === 'shapes' && (
        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-100">
          <button
            onClick={addGlassCard}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Стеклянная карта</span>
            <span className="text-[10px] text-zinc-500">Glassmorphism</span>
          </button>

          <button
            onClick={addSolidRectangle}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Плашка фона</span>
            <span className="text-[10px] text-zinc-500">Скругленная</span>
          </button>

          <button
            onClick={addCircle}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Круг / Аватар</span>
            <span className="text-[10px] text-zinc-500">Свечение</span>
          </button>

          <button
            onClick={addAccentLine}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Золотая линия</span>
            <span className="text-[10px] text-zinc-500">Акцентный штрих</span>
          </button>

          <button
            onClick={addDivider}
            className="col-span-2 p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
          >
            <span className="font-medium text-xs text-zinc-300 group-hover:text-amber-400">Тонкий разделитель</span>
            <span className="text-[10px] text-zinc-500">На всю ширину</span>
          </button>
        </div>
      )}

      {/* 3. DECOR CATEGORY */}
      {activeCategory === 'decor' && (
        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-100">
          <button
            onClick={addSparkles}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Искры ✨
            </span>
            <span className="text-[10px] text-zinc-500">Звездный акцент</span>
          </button>

          <button
            onClick={addGlowOrb}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" /> Неоновый Glow
            </span>
            <span className="text-[10px] text-zinc-500">Мягкое свечение</span>
          </button>

          <button
            onClick={addVignetteBottom}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Виньетка низа</span>
            <span className="text-[10px] text-zinc-500">Затенение под текст</span>
          </button>

          <button
            onClick={addCornerDecor}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400">Уголки рамки</span>
            <span className="text-[10px] text-zinc-500">Орнамент</span>
          </button>
        </div>
      )}

      {/* 4. HEADERS & FOOTERS (КОЛОНТИТУЛЫ) */}
      {activeCategory === 'headers' && (
        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-100">
          <button
            onClick={addBrandHeader}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-zinc-200 group-hover:text-amber-400">Хедер автора</span>
            <span className="text-[10px] text-zinc-500">@handle бренда</span>
          </button>

          <button
            onClick={addSlideCounter}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-zinc-200 group-hover:text-amber-400">Счетчик слайда</span>
            <span className="text-[10px] text-zinc-500">01 / 08</span>
          </button>

          <button
            onClick={addSwipeButton}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-amber-400">листай →</span>
            <span className="text-[10px] text-zinc-500">Стрелка перехода</span>
          </button>

          <button
            onClick={addSaveButton}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer group"
          >
            <span className="font-bold text-xs text-amber-400">сохрани 🏷️</span>
            <span className="text-[10px] text-zinc-500">Финальный CTA</span>
          </button>
        </div>
      )}
    </div>
  );
};
