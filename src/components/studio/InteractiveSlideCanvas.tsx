import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, SlideItem, ClientProfile } from '../../types';
import { getSlideElements } from '../../lib/canvas/element-converter';

interface InteractiveSlideCanvasProps {
  slide: SlideItem;
  profile: ClientProfile;
  totalSlides: number;
  bgPhotoUrl: string | null;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElements: (elements: CanvasElement[]) => void;
  scale?: number;
}

export const InteractiveSlideCanvas: React.FC<InteractiveSlideCanvasProps> = ({
  slide,
  profile,
  totalSlides,
  bgPhotoUrl,
  selectedElementId,
  onSelectElement,
  onUpdateElements,
  scale = 0.44,
}) => {
  const isCover = slide.type === 'cover';
  const activePhoto = slide.photoUrl !== undefined ? slide.photoUrl : (isCover ? bgPhotoUrl : null);
  const elements = getSlideElements(slide, profile, totalSlides, activePhoto);
  const bgColor = slide.slideBgColor || profile.defaultBgColor || '#1c1917';
  const accentColor = slide.slideAccentColor || profile.defaultAccentColor || '#D1B852';

  // Dynamically load Google Fonts for elements
  useEffect(() => {
    const fontsToLoad = new Set<string>();
    elements.forEach(el => {
      if ((el.type === 'text' || el.type === 'badge') && el.fontFamily) {
        fontsToLoad.add(el.fontFamily);
      }
    });

    fontsToLoad.forEach(font => {
      const linkId = `gfont-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [elements]);

  const photoOpacity = (slide.photoOpacity !== undefined ? slide.photoOpacity : (activePhoto ? 90 : 20)) / 100;
  const overlayMode = slide.overlayGradient || (activePhoto ? 'dark_bottom' : 'none');

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elemX: number; elemY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ startX: number; startW: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mouse Drag Handler
  const handleMouseDown = (e: React.MouseEvent, elem: CanvasElement) => {
    e.stopPropagation();
    onSelectElement(elem.id);
    setDraggingId(elem.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
    });
  };

  // Resize Handler
  const handleResizeMouseDown = (e: React.MouseEvent, elem: CanvasElement) => {
    e.stopPropagation();
    setResizingId(elem.id);
    setResizeStart({
      startX: e.clientX,
      startW: elem.width,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId && dragStart) {
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;
        const updated = elements.map((el) =>
          el.id === draggingId
            ? { ...el, x: Math.max(0, Math.min(1080 - el.width, dragStart.elemX + deltaX)), y: Math.max(0, Math.min(1350 - 40, dragStart.elemY + deltaY)) }
            : el
        );
        onUpdateElements(updated);
      } else if (resizingId && resizeStart) {
        const deltaW = (e.clientX - resizeStart.startX) / scale;
        const updated = elements.map((el) =>
          el.id === resizingId
            ? { ...el, width: Math.max(80, Math.min(1060, resizeStart.startW + deltaW)) }
            : el
        );
        onUpdateElements(updated);
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
      setDragStart(null);
      setResizeStart(null);
    };

    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, dragStart, resizeStart, elements, scale, onUpdateElements]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setEditingId(null);
    }
  };

  const renderAccentText = (text: string, accentWords: string[] | undefined) => {
    if (!accentWords || accentWords.length === 0) return <span>{text}</span>;
    const words = text.split(' ');
    return (
      <span>
        {words.map((word, i) => {
          const isAccent = accentWords.some(
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
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
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="relative overflow-hidden shadow-2xl rounded-2xl select-none cursor-default"
      style={{
        width: `${1080 * scale}px`,
        height: `${1350 * scale}px`,
      }}
    >
      {/* 1080x1350 Scaled Canvas Frame */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: '1080px',
          height: '1350px',
          transform: `scale(${scale})`,
          backgroundColor: activePhoto ? '#09090b' : bgColor,
          fontFamily: '"Source Sans 3", "Source Sans Pro", sans-serif',
        }}
      >
        {/* Crisp Slide Photo with Dynamic Contrast Overlay */}
        {activePhoto && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ 
                backgroundImage: `url(${activePhoto})`,
                opacity: photoOpacity,
              }}
            />

            {/* Smart Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: overlayMode === 'dark_bottom'
                  ? 'linear-gradient(to top, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.85) 45%, rgba(9,9,11,0.25) 75%, rgba(9,9,11,0.55) 100%)'
                  : overlayMode === 'dark_full'
                  ? 'rgba(9,9,11,0.75)'
                  : 'linear-gradient(to top, rgba(9,9,11,0.8) 0%, rgba(9,9,11,0.2) 60%, rgba(9,9,11,0.4) 100%)',
              }}
            />
          </>
        )}

        {/* Freeform Canva Elements */}
        {elements.map((el) => {
          const isSelected = selectedElementId === el.id;
          const isEditing = editingId === el.id;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el)}
              onDoubleClick={() => setEditingId(el.id)}
              className={`absolute cursor-move transition-shadow group ${
                isSelected
                  ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-950/50 rounded-lg shadow-2xl'
                  : 'hover:ring-1 hover:ring-white/30 rounded-lg'
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: el.width ? `${el.width}px` : 'auto',
                height: el.height ? `${el.height}px` : 'auto',
                zIndex: el.zIndex || 10,
                backgroundColor: el.bgColor || 'transparent',
                borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px',
                border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || accentColor}` : 'none',
                padding: el.type === 'text' && el.bgColor && el.bgColor !== 'transparent' ? '18px 24px' : '0px',
                backdropFilter: el.backdropBlur || (el.bgColor && el.bgColor.includes('rgba')) ? 'blur(16px)' : 'none',
                opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
              }}
            >
              {/* SHAPE: Rectangle / Pill / Line / Circle / Glass Card / Glow */}
              {el.type === 'shape' && (
                <>
                  {el.shapeType === 'glow_orb' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '999px',
                        background: `radial-gradient(circle, ${el.bgColor || accentColor} 0%, transparent 70%)`,
                        filter: 'blur(30px)',
                      }}
                    />
                  ) : el.shapeType === 'vignette_bottom' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                      }}
                    />
                  ) : el.shapeType === 'corner_decor' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderTop: `4px solid ${el.borderColor || accentColor}`,
                        borderLeft: `4px solid ${el.borderColor || accentColor}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: el.bgColor || accentColor,
                        borderRadius: el.borderRadius ? `${el.borderRadius}px` : '999px',
                      }}
                    />
                  )}
                </>
              )}

              {/* BADGE: Pill Tag / CTA Button */}
              {el.type === 'badge' && (
                <div
                  className="flex items-center justify-center font-bold tracking-tight px-6"
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: `${el.fontSize || 32}px`,
                    color: el.color || accentColor,
                    backgroundColor: el.bgColor || 'rgba(0,0,0,0.65)',
                    borderRadius: `${el.borderRadius || 999}px`,
                    border: `1.5px solid ${el.borderColor || `${accentColor}40`}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontFamily: el.fontFamily || undefined,
                  }}
                >
                  {el.text}
                </div>
              )}

              {/* TEXT: Headline / Subhead / Card / Quote */}
              {el.type === 'text' && (
                <div
                  style={{
                    fontSize: `${el.fontSize || 38}px`,
                    fontWeight: el.fontWeight || 500,
                    color: el.color || '#FFFFFF',
                    textAlign: el.textAlign || 'left',
                    lineHeight: el.fontSize && el.fontSize > 50 ? 1.2 : 1.35,
                    whiteSpace: 'pre-wrap',
                    textShadow: activePhoto ? '0 2px 10px rgba(0,0,0,0.7)' : 'none',
                    fontFamily: el.fontFamily || undefined,
                  }}
                >
                  {isEditing ? (
                    <textarea
                      autoFocus
                      defaultValue={el.text}
                      onBlur={(e) => {
                        setEditingId(null);
                        const updated = elements.map((item) =>
                          item.id === el.id ? { ...item, text: e.target.value } : item
                        );
                        onUpdateElements(updated);
                      }}
                      className="w-full bg-zinc-900 text-white p-2 rounded border border-amber-500 focus:outline-none resize-none font-inherit text-inherit"
                      style={{ fontSize: `${el.fontSize}px` }}
                    />
                  ) : (
                    renderAccentText(el.text || '', el.accentWords)
                  )}
                </div>
              )}

              {/* Resize Handle for Selected Element */}
              {isSelected && (
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, el)}
                  className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-full cursor-ew-resize shadow-md"
                  title="Изменить ширину"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
