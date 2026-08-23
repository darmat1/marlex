import React, { useRef } from 'react';
import { Image as ImageIcon, Sparkles, Layout, Trash2, Upload, Wand2, Plus } from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { extractPaletteFromImage } from '../../lib/palette/color-extractor';

export const PhotoPaletteUpload: React.FC = () => {
  const {
    projectImages,
    addProjectImage,
    removeProjectImage,
    autoAssignImagesToSlides,
    bgColor,
    setBgColor,
    accentColor,
    setAccentColor,
    currentResult,
    activeSlideIndex,
    setSlidePhoto,
    bgPhotoUrl,
  } = useMarlexStore();

  const activeSlide = currentResult?.slides[activeSlideIndex];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        addProjectImage(dataUrl);

        // If it's the first image, extract palette
        if (i === 0) {
          const { bgColor: extractedBg, accentColor: extractedAccent } = await extractPaletteFromImage(dataUrl);
          if (extractedBg) setBgColor(extractedBg);
          if (extractedAccent) setAccentColor(extractedAccent);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. MULTI-IMAGE ASSET POOL */}
      <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            Галерея картинок ({projectImages.length})
          </span>
          {projectImages.length > 0 && (
            <button
              onClick={autoAssignImagesToSlides}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
              title="ИИ распределит фото по слайдам и настроит контраст"
            >
              <Wand2 className="w-3 h-3" />
              Авто-распределить
            </button>
          )}
        </div>

        {/* Upload Trigger */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleMultiFileUpload}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-3 border border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-950/40 cursor-pointer text-xs"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Загрузить фото (можно сразу несколько)</span>
        </button>

        {/* Image Thumbnails Grid */}
        {projectImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {projectImages.map((imgUrl, idx) => {
              const isSelected = activeSlide?.photoUrl === imgUrl || (activeSlideIndex === 0 && !activeSlide?.photoUrl && bgPhotoUrl === imgUrl);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isSelected) {
                      // Toggle off
                      setSlidePhoto(activeSlideIndex, null);
                    } else {
                      // Apply to current slide
                      setSlidePhoto(activeSlideIndex, imgUrl, 90, 'bottom');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isSelected) {
                        setSlidePhoto(activeSlideIndex, null);
                      } else {
                        setSlidePhoto(activeSlideIndex, imgUrl, 90, 'bottom');
                      }
                    }
                  }}
                  className={`relative group rounded-xl overflow-hidden h-20 bg-zinc-950 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
                      : 'border-zinc-800 hover:border-zinc-650 opacity-80 hover:opacity-100'
                  }`}
                  title={isSelected ? 'Применено к текущему слайду (кликните, чтобы снять)' : 'Применить к текущему слайду'}
                  aria-label={isSelected ? 'Применено к текущему слайду (кликните, чтобы снять)' : 'Применить к текущему слайду'}
                >
                  <img src={imgUrl} alt={`Asset ${idx}`} className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${isSelected ? 'brightness-75' : ''}`} />

                  {/* Selected Indicator: Dark Overlay + Golden Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md font-bold animate-in zoom-in-75 duration-150">
                        <Sparkles className="w-3.5 h-3.5 hidden" />
                        <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Delete from gallery button (on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProjectImage(imgUrl);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-md bg-zinc-900/90 hover:bg-red-500 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow cursor-pointer z-10"
                    title="Удалить из галереи"
                    aria-label="Удалить из галереи"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PROJECT PALETTE COLORS */}
      <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
        <span className="text-xs font-bold text-zinc-200 block">
          Фирменные цвета
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Background Color */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-medium">Фон контента</span>
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-zinc-300">{bgColor}</span>
            </div>
          </div>

          {/* Accent Color */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-medium">Плашка акцента</span>
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-zinc-300">{accentColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
