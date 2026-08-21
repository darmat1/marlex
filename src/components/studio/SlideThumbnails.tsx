import React from 'react';
import { Plus } from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { SlidePreview } from './SlidePreview';

export const SlideThumbnails: React.FC = () => {
  const {
    currentResult,
    activeSlideIndex,
    setActiveSlideIndex,
    addSlide,
    activeProfile,
    bgPhotoUrl,
  } = useMarlexStore();

  if (!currentResult) return null;

  return (
    <div className="h-44 border-t border-zinc-800/80 bg-zinc-950/90 px-4 py-2 flex items-center gap-3 overflow-x-auto select-none">
      {currentResult.slides.map((slide, idx) => {
        const isActive = activeSlideIndex === idx;
        return (
          <div
            key={slide.id || idx}
            onClick={() => setActiveSlideIndex(idx)}
            className={`relative flex-shrink-0 cursor-pointer rounded-lg p-1 transition-all group ${
              isActive
                ? 'ring-2 ring-amber-500 bg-amber-500/10'
                : 'hover:ring-1 hover:ring-zinc-600 opacity-70 hover:opacity-100'
            }`}
          >
            {/* Scaled-down tiny preview */}
            <div className="pointer-events-none rounded overflow-hidden shadow">
              <SlidePreview
                slide={slide}
                profile={activeProfile}
                totalSlides={currentResult.slides.length}
                bgPhotoUrl={bgPhotoUrl}
                scale={0.09} // tiny thumbnail
              />
            </div>

            {/* Slide Index Badge */}
            <div
              className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              #{slide.slideNumber}
            </div>
          </div>
        );
      })}

      {/* Add Slide Button */}
      <button
        onClick={() => addSlide(currentResult.slides.length - 1)}
        className="flex-shrink-0 w-24 h-32 rounded-lg border border-dashed border-zinc-700 hover:border-amber-500 hover:bg-amber-500/5 flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-amber-400 transition-all text-xs font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>+ Слайд</span>
      </button>
    </div>
  );
};
