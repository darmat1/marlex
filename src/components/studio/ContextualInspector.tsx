import React, { useState } from 'react';
import { 
  Sliders, 
  Tag, 
  Trash2, 
  Copy, 
  Layers, 
  Type, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  LayoutTemplate,
  Bold,
  Square,
  Circle,
  Palette
} from 'lucide-react';
import { CanvasElement, SlideItem, TextPositionMode, OverlayGradientMode } from '../../types';
import { useMarlexStore } from '../../lib/store/useMarlexStore';

interface ContextualInspectorProps {
  slide: SlideItem;
  slideIndex: number;
  selectedElement: CanvasElement | null;
  onUpdateElement: (updated: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onDeselect: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Белый', value: '#FFFFFF' },
  { name: 'Золото', value: '#D1B852' },
  { name: 'Янтарь', value: '#F59E0B' },
  { name: 'Светло-серый', value: '#E4E4E7' },
  { name: 'Темный', value: '#18181B' },
];

const BG_SWATCHES = [
  { name: 'Без фона', value: 'transparent' },
  { name: 'Темное стекло', value: 'rgba(0, 0, 0, 0.65)' },
  { name: 'Золото', value: '#D1B852' },
  { name: 'Светлое стекло', value: 'rgba(255, 255, 255, 0.12)' },
];

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  slide,
  slideIndex,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onDeselect,
}) => {
  const { 
    updateSlide, 
    deleteSlide, 
    addSlide, 
    currentResult, 
    projectImages, 
    addProjectImage,
    bgPhotoUrl,
    activeProject 
  } = useMarlexStore();

  const [newAccentWord, setNewAccentWord] = useState('');

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

  const handleSlidePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      addProjectImage(url);
      updateSlide(slideIndex, {
        photoUrl: url,
        photoOpacity: 90,
        textPosition: 'bottom',
      });
    };
    reader.readAsDataURL(file);
  };

  const isCover = slide.type === 'cover';
  const currentPhoto = slide.photoUrl !== undefined ? slide.photoUrl : (isCover ? bgPhotoUrl : null);
  const isText = selectedElement?.type === 'text' || selectedElement?.type === 'badge';

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur-md border-l border-zinc-800/80 w-72 select-none overflow-y-auto">
      {/* Inspector Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200">
            {selectedElement ? 'Свойства элемента' : `Слайд #${slide.slideNumber}`}
          </span>
        </div>

        {selectedElement ? (
          <button
            onClick={onDeselect}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer"
            title="Снять выделение"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Инспектор</span>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* CASE A: ELEMENT IS SELECTED */}
        {selectedElement ? (
          <div className="space-y-4">
            {/* Element Type & Action Buttons */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedElement.shapeType || selectedElement.type.toUpperCase()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onDuplicateElement}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                  title="Дублировать элемент"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onDeleteElement}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                  title="Удалить элемент"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Typography Controls */}
            {isText && (
              <>
                {/* Font Family Selector */}
                <div>
                  <label className="text-[11px] text-zinc-400 font-medium block mb-1.5">Шрифт</label>
                  <select
                    value={selectedElement.fontFamily || activeProject.font || 'Source Sans 3'}
                    onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer mb-3"
                  >
                    <option value="Source Sans 3" style={{ fontFamily: 'Source Sans 3' }}>Source Sans 3</option>
                    <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                    <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                    <option value="Playfair Display" style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                    <option value="Roboto" style={{ fontFamily: 'Roboto' }}>Roboto</option>
                    <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
                    <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
                  </select>
                </div>

                {/* Font Size & Stepper */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-1.5">
                    <span>Размер шрифта</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedElement.fontSize || 38}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={100}
                    step={2}
                    value={selectedElement.fontSize || 38}
                    onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  {/* Size Presets */}
                  <div className="grid grid-cols-4 gap-1 mt-1.5">
                    {[
                      { label: 'H1 62', size: 62, weight: 800 },
                      { label: 'H2 44', size: 44, weight: 600 },
                      { label: 'Body 38', size: 38, weight: 400 },
                      { label: 'Tag 26', size: 26, weight: 700 }
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => onUpdateElement({ fontSize: p.size, fontWeight: p.weight })}
                        className={`py-1 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                          selectedElement.fontSize === p.size
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color Swatches & Custom Picker */}
                <div>
                  <label className="text-[11px] text-zinc-400 font-medium block mb-1.5">Цвет текста</label>
                  <div className="flex items-center gap-1.5 mb-2">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.value}
                        onClick={() => onUpdateElement({ color: swatch.value })}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                          selectedElement.color === swatch.value
                            ? 'ring-2 ring-amber-500 scale-110 border-white'
                            : 'border-zinc-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                        title={swatch.name}
                      />
                    ))}
                    <div className="flex items-center gap-1 ml-auto p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={selectedElement.color || '#FFFFFF'}
                        onChange={(e) => onUpdateElement({ color: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono text-zinc-400">{selectedElement.color || '#FFF'}</span>
                    </div>
                  </div>
                </div>

                {/* Background Pill & Glassmorphism */}
                <div>
                  <label className="text-[11px] text-zinc-400 font-medium block mb-1.5">Фон подложки / Плашка</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BG_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.value}
                        onClick={() => onUpdateElement({ 
                          bgColor: swatch.value,
                          borderRadius: swatch.value !== 'transparent' ? 18 : 0,
                          backdropBlur: swatch.value.includes('rgba')
                        })}
                        className={`py-1.5 px-2 rounded-lg border text-left text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                          (selectedElement.bgColor || 'transparent') === swatch.value
                            ? 'border-amber-500 bg-zinc-850 text-amber-300'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: swatch.value }} />
                        <span className="truncate">{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment & Weight */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Выравнивание</label>
                    <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => onUpdateElement({ textAlign: align })}
                          className={`py-1 flex items-center justify-center rounded text-xs transition-all cursor-pointer ${
                            (selectedElement.textAlign || 'left') === align
                              ? 'bg-zinc-800 text-amber-400 shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Начертание</label>
                    <button
                      onClick={() => onUpdateElement({ 
                        fontWeight: (selectedElement.fontWeight === 800 || selectedElement.fontWeight === 700 || selectedElement.fontWeight === 'bold') ? 400 : 800 
                      })}
                      className={`w-full py-1.5 rounded-lg border flex items-center justify-center gap-1 text-xs font-semibold transition-all cursor-pointer ${
                        (selectedElement.fontWeight === 800 || selectedElement.fontWeight === 700 || selectedElement.fontWeight === 'bold')
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                      {(selectedElement.fontWeight === 800 || selectedElement.fontWeight === 700) ? 'Bold' : 'Regular'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Shape / Ornament Specific Controls */}
            {selectedElement.type === 'shape' && (
              <div className="space-y-3">
                {/* Shape Fill Color */}
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Цвет заливки</label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <input
                      type="color"
                      value={selectedElement.bgColor?.startsWith('#') ? selectedElement.bgColor : activeProject.accentColor}
                      onChange={(e) => onUpdateElement({ bgColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-zinc-200">{selectedElement.bgColor || 'Акцент'}</span>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Скругление углов</span>
                    <span className="font-mono text-amber-400">{selectedElement.borderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={2}
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) => onUpdateElement({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Прозрачность фигуры</span>
                    <span className="font-mono text-amber-400">{selectedElement.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={selectedElement.opacity ?? 100}
                    onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CASE B: NO ELEMENT SELECTED (SLIDE LEVEL PROPERTIES) */
          <div className="space-y-5">
            {/* Slide Type */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Тип слайда
              </label>
              <select
                value={slide.type}
                onChange={(e) => updateSlide(slideIndex, { type: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="cover">Обложка (Cover Hook)</option>
                <option value="content">Контент (Body Insight)</option>
                <option value="final">Финал (Call to Action)</option>
              </select>
            </div>

            {/* PER-SLIDE PHOTO & SMART PLACEMENT */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Картинка слайда
                </label>
                {currentPhoto && (
                  <button
                    onClick={() => updateSlide(slideIndex, { photoUrl: null })}
                    className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Удалить фото
                  </button>
                )}
              </div>

              {/* Upload or Pick Image from Project Gallery */}
              <div className="space-y-2">
                {currentPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-24 bg-zinc-900 group">
                    <img src={currentPhoto} alt="Slide visual" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <label className="text-xs bg-amber-500 text-zinc-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-amber-400 shadow-md">
                        Заменить
                        <input type="file" accept="image/*" onChange={handleSlidePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/40 hover:bg-zinc-900 transition-colors cursor-pointer text-center">
                    <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                    <span className="text-xs text-zinc-300 font-medium">Загрузить фото для слайда</span>
                    <span className="text-[10px] text-zinc-500">JPG, PNG, WebP</span>
                    <input type="file" accept="image/*" onChange={handleSlidePhotoUpload} className="hidden" />
                  </label>
                )}

                {/* Project Gallery Quick Select with Checkmark */}
                {projectImages.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 block mb-1.5">Галерея проекта:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {projectImages.map((imgUrl, i) => {
                        const isSelected = currentPhoto === imgUrl;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (isSelected) {
                                updateSlide(slideIndex, { photoUrl: null });
                              } else {
                                updateSlide(slideIndex, { photoUrl: imgUrl, textPosition: 'bottom' });
                              }
                            }}
                            className={`relative h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-amber-500 ring-2 ring-amber-500 shadow-md' 
                                : 'border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-700'
                            }`}
                            title={isSelected ? 'Применено к слайду (кликните, чтобы убрать)' : 'Применить к слайду'}
                          >
                            <img src={imgUrl} alt={`Asset ${i}`} className={`w-full h-full object-cover ${isSelected ? 'brightness-75' : ''}`} />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                <div className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md font-bold">
                                  <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Photo Opacity & Text Position */}
                {currentPhoto && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Прозрачность фото</span>
                        <span className="font-mono text-amber-400">{slide.photoOpacity ?? 90}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={slide.photoOpacity ?? 90}
                        onChange={(e) => updateSlide(slideIndex, { photoOpacity: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Text Position Mode */}
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1">
                        <LayoutTemplate className="w-3 h-3 text-amber-400" />
                        Позиция текста (чтобы не закрывать суть):
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[11px]">
                        {(['bottom', 'center', 'top'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => updateSlide(slideIndex, { textPosition: pos })}
                            className={`py-1 rounded font-medium transition-all cursor-pointer ${
                              (slide.textPosition || 'bottom') === pos
                                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {pos === 'bottom' ? 'Внизу' : pos === 'top' ? 'Вверху' : 'Центр'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Accent Keywords (Golden Badges) */}
            <div className="space-y-2 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  Золотые акценты
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {slide.accentWords?.length || 0}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {slide.accentWords && slide.accentWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400 text-zinc-950 shadow-sm"
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveAccent(word)}
                      className="hover:text-red-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddAccent} className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={newAccentWord}
                  onChange={(e) => setNewAccentWord(e.target.value)}
                  placeholder="Слово для подсветки..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-amber-400 rounded-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </form>
            </div>

            {/* Swipe Arrow / CTA Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300">
              <span className="text-[11px] font-medium">Стрелка перехода (листай →)</span>
              <input
                type="checkbox"
                checked={slide.showArrow}
                onChange={(e) => updateSlide(slideIndex, { showArrow: e.target.checked })}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Slide Action Buttons */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => addSlide(slideIndex)}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                + Дублировать / Вставить слайд
              </button>

              {currentResult && currentResult.slides.length > 1 && (
                <button
                  onClick={() => deleteSlide(slideIndex)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 text-xs text-zinc-400 hover:text-red-400 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Удалить текущий слайд
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
