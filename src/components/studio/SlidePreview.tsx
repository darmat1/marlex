import React from 'react';
import { SlideItem, ClientProfile } from '../../types';

interface SlidePreviewProps {
  slide: SlideItem;
  profile: ClientProfile;
  totalSlides: number;
  bgPhotoUrl: string | null;
  scale?: number;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  profile,
  totalSlides,
  bgPhotoUrl,
  scale = 0.44,
}) => {
  const isCover = slide.type === 'cover';
  const activePhoto = slide.photoUrl !== undefined ? slide.photoUrl : (isCover ? bgPhotoUrl : null);
  const bgColor = slide.slideBgColor || profile.defaultBgColor || '#1c1917';
  const accentColor = slide.slideAccentColor || profile.defaultAccentColor || '#D1B852';
  const textColor = profile.defaultTextColor || '#FFFFFF';

  const renderTextWithAccents = (text: string) => {
    if (!slide.accentWords || slide.accentWords.length === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(' ');
    return (
      <span>
        {words.map((word, i) => {
          const isAccent = slide.accentWords && slide.accentWords.some(
            (acc) => acc && word.toLowerCase().includes(acc.toLowerCase().trim())
          );
          if (isAccent) {
            return (
              <span
                key={i}
                style={{
                  backgroundColor: accentColor,
                  color: '#09090b',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  display: 'inline-block',
                  margin: '0 3px',
                  fontWeight: 800,
                }}
              >
                {word}{' '}
              </span>
            );
          }
          return <span key={i}>{word} </span>;
        })}
      </span>
    );
  };

  return (
    <div
      className="relative overflow-hidden shadow-2xl rounded-2xl select-none"
      style={{
        width: `${1080 * scale}px`,
        height: `${1350 * scale}px`,
      }}
    >
      {/* 1080x1350 Full Canvas scaled via CSS Transform */}
      <div
        className="absolute top-0 left-0 origin-top-left flex flex-col justify-between"
        style={{
          width: '1080px',
          height: '1350px',
          transform: `scale(${scale})`,
          backgroundColor: activePhoto ? '#09090b' : bgColor,
          fontFamily: '"Source Sans 3", "Source Sans Pro", sans-serif',
          color: textColor,
          padding: '80px',
        }}
      >
        {/* Photo Background & Smart Gradient */}
        {activePhoto && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url(${activePhoto})`,
                opacity: (slide.photoOpacity ?? 90) / 100,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.85) 45%, rgba(9,9,11,0.2) 75%, rgba(9,9,11,0.5) 100%)',
              }}
            />
          </>
        )}

        {/* 1. Slide Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-3xl tracking-tight">{profile.instagramHandle}</span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
          </div>
          <span className="font-mono text-2xl text-white/60">
            {slide.slideNumber.toString().padStart(2, '0')} / {totalSlides.toString().padStart(2, '0')}
          </span>
        </div>

        {/* 2. Slide Body Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 py-12 space-y-8">
          {slide.headline && (
            <h2 className="text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              {renderTextWithAccents(slide.headline)}
            </h2>
          )}

          {slide.subheadline && (
            <p className="text-4xl font-medium leading-relaxed text-white/90">
              {renderTextWithAccents(slide.subheadline)}
            </p>
          )}

          {slide.bodyParagraphs && slide.bodyParagraphs.length > 0 && (
            <div className="space-y-4 pt-4">
              {slide.bodyParagraphs.map((para, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-white/10 text-3xl leading-snug"
                  style={{
                    backgroundColor: activePhoto ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {renderTextWithAccents(para)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Slide Footer */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-2xl font-medium text-white/60">
          <span>{profile.name}</span>

          {slide.showArrow && (
            <div
              className="flex items-center gap-2 px-6 py-2 rounded-full font-bold text-2xl"
              style={{
                backgroundColor: 'rgba(0,0,0,0.65)',
                color: accentColor,
                border: `1.5px solid ${accentColor}50`,
              }}
            >
              листай →
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
