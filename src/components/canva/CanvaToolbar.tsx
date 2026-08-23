import React, { useState } from 'react';
import { 
  Bold, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Type, 
  Palette, 
  Square,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CanvasElement } from '../../types';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { DEFAULT_ACCENT_COLOR } from '../../lib/constants';

interface CanvaToolbarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (updated: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Белый', value: '#FFFFFF' },
  { name: 'Золото', value: DEFAULT_ACCENT_COLOR },
  { name: 'Янтарь', value: '#F59E0B' },
  { name: 'Светло-серый', value: '#E4E4E7' },
  { name: 'Черный', value: '#09090B' },
];

const BG_SWATCHES = [
  { name: 'Без фона', value: 'transparent' },
  { name: 'Темное стекло', value: 'rgba(0, 0, 0, 0.65)' },
  { name: 'Золотая плашка', value: DEFAULT_ACCENT_COLOR },
  { name: 'Светлая плашка', value: 'rgba(255, 255, 255, 0.12)' },
];

export const CanvaToolbar: React.FC<CanvaToolbarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  const { activeProject } = useMarlexStore();
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);

  if (!selectedElement) {
    return (
      <div className="h-11 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-500 select-none">
        <span className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-zinc-600" />
          Кликните на любой элемент на холсте для редактирования, изменения размера и перемещения
        </span>
        <span className="font-mono text-[11px] text-zinc-600">Холст 1080 × 1350 px</span>
      </div>
    );
  }

  const isText = selectedElement.type === 'text' || selectedElement.type === 'badge';

  return (
    <div className="h-11 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between gap-3 text-xs select-none shadow-sm z-20">
      {/* Left controls: Typography, Colors & Styles */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-500/20">
          {selectedElement.shapeType || selectedElement.type}
        </span>

        {isText && (
          <>
            {/* Font Size controls (+ / - and Direct Number Input) */}
            <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
              <button
                onClick={() => onUpdateElement({ fontSize: Math.max(16, (selectedElement.fontSize || 40) - 4) })}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                title="Уменьшить шрифт"
                aria-label="Уменьшить шрифт"
              >
                -
              </button>
              <input
                type="number"
                value={selectedElement.fontSize || 40}
                onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                className="w-11 text-center bg-transparent text-zinc-200 text-xs font-mono focus:outline-none border-x border-zinc-800"
              />
              <button
                onClick={() => onUpdateElement({ fontSize: Math.min(140, (selectedElement.fontSize || 40) + 4) })}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                title="Увеличить шрифт"
              >
                +
              </button>
            </div>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => onUpdateElement({ fontSize: 62, fontWeight: 800 })}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                title="Размер H1 (62px)"
              >
                H1
              </button>
              <button
                onClick={() => onUpdateElement({ fontSize: 44, fontWeight: 600 })}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                title="Размер H2 (44px)"
              >
                H2
              </button>
              <button
                onClick={() => onUpdateElement({ fontSize: 36, fontWeight: 400 })}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                title="Размер Тело (36px)"
              >
                P
              </button>
            </div>

            {/* Text Color Picker */}
            <div className="relative">
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white cursor-pointer"
                title="Цвет текста"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm"
                  style={{ backgroundColor: selectedElement.color || '#FFFFFF' }}
                />
                <span className="text-[11px] font-mono">{selectedElement.color || '#FFF'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
              </button>

              {isColorMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-44 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Цвет шрифта:</span>
                  <div className="flex gap-1.5">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.value}
                        onClick={() => {
                          onUpdateElement({ color: swatch.value });
                          setIsColorMenuOpen(false);
                        }}
                        className="w-6 h-6 rounded-full border border-zinc-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        style={{ backgroundColor: swatch.value }}
                        title={swatch.name}
                aria-label={swatch.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800">
                    <input
                      type="color"
                      value={selectedElement.color || '#FFFFFF'}
                      onChange={(e) => onUpdateElement({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] text-zinc-400">Свой цвет</span>
                  </div>
                </div>
              )}
            </div>

            {/* Background / Highlight Pill Picker */}
            <div className="relative">
              <button
                onClick={() => setIsBgMenuOpen(!isBgMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white cursor-pointer"
                title="Фоновая плашка"
                aria-label="Фоновая плашка"
              >
                <Square className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">
                  {selectedElement.bgColor && selectedElement.bgColor !== 'transparent' ? 'Плашка' : 'Без фона'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
              </button>

              {isBgMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block px-1">Фон элемента:</span>
                  {BG_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.value}
                      onClick={() => {
                        onUpdateElement({ 
                          bgColor: swatch.value,
                          borderRadius: swatch.value !== 'transparent' ? 18 : 0,
                          backdropBlur: swatch.value.includes('rgba')
                        });
                        setIsBgMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                    >
                      <div className="w-3.5 h-3.5 rounded border border-zinc-700" style={{ backgroundColor: swatch.value }} />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bold Toggle */}
            <button
              onClick={() => onUpdateElement({ 
                fontWeight: (selectedElement.fontWeight === 800 || selectedElement.fontWeight === 700 || selectedElement.fontWeight === 'bold') ? 400 : 800 
              })}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                (selectedElement.fontWeight === 800 || selectedElement.fontWeight === 700 || selectedElement.fontWeight === 'bold')
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Жирный шрифт"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Alignment */}
            <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 p-0.5">
              <button
                onClick={() => onUpdateElement({ textAlign: 'left' })}
                className={`p-1 rounded cursor-pointer ${selectedElement.textAlign === 'left' || !selectedElement.textAlign ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="По левому краю"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateElement({ textAlign: 'center' })}
                className={`p-1 rounded cursor-pointer ${selectedElement.textAlign === 'center' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="По центру"
                aria-label="По центру"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateElement({ textAlign: 'right' })}
                className={`p-1 rounded cursor-pointer ${selectedElement.textAlign === 'right' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="По правому краю"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* Shape / Ornament Specific Color Controls */}
        {selectedElement.type === 'shape' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Цвет заливки:</span>
            <input
              type="color"
              value={selectedElement.bgColor?.startsWith('#') ? selectedElement.bgColor : DEFAULT_ACCENT_COLOR}
              onChange={(e) => onUpdateElement({ bgColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        )}
      </div>

      {/* Right controls: Z-Index Layers, Duplicate, Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateElement({ zIndex: (selectedElement.zIndex || 10) + 5 })}
          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Переместить вперед (слой выше)"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdateElement({ zIndex: Math.max(1, (selectedElement.zIndex || 10) - 5) })}
          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Переместить назад (слой ниже)"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

        <button
          onClick={onDuplicateElement}
          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Дублировать элемент"
                aria-label="Дублировать элемент"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDeleteElement}
          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-red-500/20 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Удалить элемент"
                aria-label="Удалить элемент"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
