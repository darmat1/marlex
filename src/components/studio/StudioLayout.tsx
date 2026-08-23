import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Wand2, 
  Layers, 
  Palette, 
  Type, 
  Sliders, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { InteractiveSlideCanvas } from './InteractiveSlideCanvas';
import { CanvaToolbar } from '../canva/CanvaToolbar';
import { CanvaElementPalette } from '../canva/CanvaElementPalette';
import { ContextualInspector } from './ContextualInspector';
import { SlideThumbnails } from './SlideThumbnails';
import { PhotoPaletteUpload } from './PhotoPaletteUpload';
import { CanvasElement } from '../../types';
import { getSlideElements } from '../../lib/canvas/element-converter';
import { SettingsModal } from '../settings/SettingsModal';

type StudioDockTab = 'prompt' | 'elements' | 'style';

export const StudioLayout: React.FC = () => {
  const {
    rawInput,
    setRawInput,
    isGenerating,
    runGeneration,
    currentResult,
    activeSlideIndex,
    setActiveSlideIndex,
    activeProfile,
    bgPhotoUrl,
    updateSlide,
  } = useMarlexStore();

  const [activeDockTab, setActiveDockTab] = useState<StudioDockTab>('prompt');
  const [isLeftDockOpen, setIsLeftDockOpen] = useState(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRunGenerationWithCheck = () => {
    const { llmConfig } = useMarlexStore.getState();
    
    // In Local CLI mode (Claude Code, ChatGPT, Gemini CLI), NO API keys are required!
    if (llmConfig.mode === 'local_cli') {
      runGeneration();
      return;
    }

    // In BYOK mode, check for respective API key
    if (llmConfig.provider === 'openai' && !llmConfig.openaiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (llmConfig.provider === 'anthropic' && !llmConfig.anthropicKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (llmConfig.provider === 'gemini' && !llmConfig.geminiKey) {
      setIsSettingsOpen(true);
      return;
    }
    runGeneration();
  };

  const activeSlide = currentResult?.slides[activeSlideIndex];
  const slideElements = activeSlide
    ? getSlideElements(activeSlide, activeProfile, currentResult?.slides.length || 1, bgPhotoUrl)
    : [];

  const selectedElement = slideElements.find((el) => el.id === selectedElementId) || null;

  const handleUpdateElements = (newElements: CanvasElement[]) => {
    if (!currentResult) return;
    updateSlide(activeSlideIndex, { elements: newElements });
  };

  const handleUpdateSelectedElement = (updated: Partial<CanvasElement>) => {
    if (!selectedElementId || !activeSlide) return;
    const newElements = slideElements.map((el) =>
      el.id === selectedElementId ? { ...el, ...updated } : el
    );
    handleUpdateElements(newElements);
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElementId || !activeSlide) return;
    const newElements = slideElements.filter((el) => el.id !== selectedElementId);
    handleUpdateElements(newElements);
    setSelectedElementId(null);
  };

  const handleDuplicateSelectedElement = () => {
    if (!selectedElement || !activeSlide) return;
    const duplicated: CanvasElement = {
      ...selectedElement,
      id: `elem_${Date.now()}`,
      x: selectedElement.x + 30,
      y: selectedElement.y + 30,
    };
    handleUpdateElements([...slideElements, duplicated]);
    setSelectedElementId(duplicated.id);
  };

  const handleAddElement = (newElement: CanvasElement) => {
    if (!activeSlide) return;
    handleUpdateElements([...slideElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
      setSelectedElementId(null);
    }
  };

  const handleNextSlide = () => {
    if (currentResult && activeSlideIndex < currentResult.slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
      setSelectedElementId(null);
    }
  };

  const loadSampleIdea = (topic: string) => {
    setRawInput(topic);
    setActiveDockTab('prompt');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (!selectedElementId || !selectedElement) return;

      // Nudging with arrow keys (1px)
      // Use Shift + Arrow for 10px nudging
      const nudgeAmount = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDeleteSelectedElement();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleUpdateSelectedElement({ y: selectedElement.y - nudgeAmount });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleUpdateSelectedElement({ y: selectedElement.y + nudgeAmount });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleUpdateSelectedElement({ x: selectedElement.x - nudgeAmount });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleUpdateSelectedElement({ x: selectedElement.x + nudgeAmount });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, activeSlide, slideElements]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden select-none font-sans">
      {/* Main Workspace: Left Dock + Center Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT TABBED DOCK (280px) */}
        {isLeftDockOpen ? (
          <aside className="w-72 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex flex-col z-20 transition-all">
            {/* Dock Tabs Header */}
            <div className="flex items-center justify-between p-2 border-b border-zinc-800/80 bg-zinc-900/40">
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setActiveDockTab('prompt')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    activeDockTab === 'prompt'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Промпт
                </button>
                <button
                  onClick={() => setActiveDockTab('elements')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    activeDockTab === 'elements'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  Элементы
                </button>
                <button
                  onClick={() => setActiveDockTab('style')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    activeDockTab === 'style'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  Стиль
                </button>
              </div>

              <button
                onClick={() => setIsLeftDockOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Свернуть панель"
                aria-label="Свернуть панель"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Dock Tab Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
              {/* TAB 1: PROMPT & GENERATOR */}
              {activeDockTab === 'prompt' && (
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Задача для ИИ
                    </label>
                    <textarea
                      rows={5}
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Опишите задачу или тему (например: «8 слайдов о том, как AI меняет стартапы» или вставьте черновик)..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none font-normal leading-relaxed"
                    />
                  </div>

                  {/* High Impact Run Button */}
                  <button
                    onClick={handleRunGenerationWithCheck}
                    disabled={isGenerating || !rawInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Генерация карусели...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        Создать карусель и посты
                      </>
                    )}
                  </button>

                  {/* Curated Idea Chips */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Быстрые примеры
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => loadSampleIdea('8 слайдов о том, как AI меняет разработку стартапов в 2026')}
                        className="text-left text-xs text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/60 p-2 rounded-lg transition-colors border border-zinc-800/50 cursor-pointer"
                      >
                        🚀 AI в стартапах 2026
                      </button>
                      <button
                        onClick={() => loadSampleIdea('7 слайдов: почему сила воли не работает и как настроить дофамин')}
                        className="text-left text-xs text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/60 p-2 rounded-lg transition-colors border border-zinc-800/50 cursor-pointer"
                      >
                        🧠 Нейробиология фокуса и дофамина
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CANVA ELEMENTS */}
              {activeDockTab === 'elements' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Добавить на холст
                  </div>
                  <CanvaElementPalette onAddElement={handleAddElement} />
                </div>
              )}

              {/* TAB 3: BRAND STYLE & PHOTO */}
              {activeDockTab === 'style' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Визуальный стиль
                  </div>
                  <PhotoPaletteUpload />
                </div>
              )}
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setIsLeftDockOpen(true)}
            className="absolute left-3 top-3 z-30 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shadow-xl transition-all cursor-pointer"
            title="Открыть панель инструментов"
            aria-label="Открыть панель инструментов"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* 2. CENTER HERO CANVAS STAGE */}
        <main className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          {/* Floating Canva Formatting Bar */}
          <CanvaToolbar
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateSelectedElement}
            onDeleteElement={handleDeleteSelectedElement}
            onDuplicateElement={handleDuplicateSelectedElement}
          />

          {/* Canvas Viewport */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {currentResult && activeSlide ? (
              <>
                {/* Slide Switcher Arrows */}
                <div className="relative flex items-center justify-center">
                  <button
                    onClick={handlePrevSlide}
                    disabled={activeSlideIndex === 0}
                    aria-label="Предыдущий слайд"
                    className="absolute -left-16 z-20 p-3 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-2xl cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* 1080x1350 Canva Interactive Canvas */}
                  <InteractiveSlideCanvas
                    slide={activeSlide}
                    profile={activeProfile}
                    totalSlides={currentResult.slides.length}
                    bgPhotoUrl={bgPhotoUrl}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    onUpdateElements={handleUpdateElements}
                    scale={0.42}
                  />

                  <button
                    onClick={handleNextSlide}
                    disabled={activeSlideIndex === currentResult.slides.length - 1}
                    aria-label="Следующий слайд"
                    className="absolute -right-16 z-20 p-3 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-2xl cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-canvas info bar */}
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-zinc-500">
                  <span className="text-zinc-300 font-semibold">
                    Слайд {activeSlideIndex + 1} / {currentResult.slides.length}
                  </span>
                  <span>•</span>
                  <span>1080 × 1350 px</span>
                </div>
              </>
            ) : (
              <div className="text-center text-zinc-500 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs">Введите задачу слева и нажмите «Создать карусель и посты»</span>
              </div>
            )}
          </div>
        </main>

        {/* 3. RIGHT CONTEXTUAL INSPECTOR */}
        {isRightInspectorOpen ? (
          <aside className="relative flex">
            {currentResult && activeSlide ? (
              <ContextualInspector
                slide={activeSlide}
                slideIndex={activeSlideIndex}
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateSelectedElement}
                onDeleteElement={handleDeleteSelectedElement}
                onDuplicateElement={handleDuplicateSelectedElement}
                onDeselect={() => setSelectedElementId(null)}
              />
            ) : (
              <div className="w-72 bg-zinc-950/80 border-l border-zinc-800 flex items-center justify-center text-xs text-zinc-600">
                Нет активного слайда
              </div>
            )}
            <button
              onClick={() => setIsRightInspectorOpen(false)}
              className="absolute left-2 top-3 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Скрыть инспектор"
              aria-label="Скрыть инспектор"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </aside>
        ) : (
          <button
            onClick={() => setIsRightInspectorOpen(true)}
            className="absolute right-3 top-3 z-30 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shadow-xl transition-all cursor-pointer"
            title="Открыть инспектор"
            aria-label="Открыть инспектор"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. BOTTOM FILMSTRIP: Thumbnails Ribbon */}
      <SlideThumbnails />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
