/**
 * ScrapbookObject — a single collage scrap. Photos, torn notes, text,
 * receipts, stickers, tape, doodles and shapes, each with editable outline,
 * paper edge, shadow and filter treatments.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrapbookObject as ScrapType, PaperStyle } from '@/types/scrapbook';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { getImageUrl, retrieveImage } from '@/utils/imageStorage';
import { StickerGraphic } from './StickerGraphic';

interface Props {
  object: ScrapType;
  canvasId: string;
  isSelected: boolean;
  zoom: number;
  onDoubleClick: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

const PAPER_CLASS: Record<PaperStyle, string> = {
  polaroid: 'paper-polaroid',
  clean: 'paper-clean',
  ripped: 'paper-ripped',
  journal: 'paper-journal',
  kraft: 'paper-kraft',
} as Record<PaperStyle, string>;

const FILTER_CSS: Record<string, string> = {
  none: 'none',
  warm: 'sepia(0.25) saturate(1.15) brightness(1.03)',
  mono: 'grayscale(1) contrast(1.05)',
  faded: 'contrast(0.9) brightness(1.08) saturate(0.8)',
  bright: 'brightness(1.12) saturate(1.2)',
};

const paperClassFor = (style: string) => PAPER_CLASS[style as PaperStyle] ?? 'paper-note';

export const ScrapbookObject: React.FC<Props> = ({
  object,
  canvasId,
  isSelected,
  zoom,
  onDoubleClick,
  onPointerDown,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const updateObjectLocal = useScrapbookStore((s) => s.updateObjectLocal);
  const updateObject = useScrapbookStore((s) => s.updateObject);
  const persist = useScrapbookStore((s) => s.persist);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let revoked: string | null = null;
    if (object.imageId) {
      retrieveImage(object.imageId).then((img) => {
        if (img) { const url = getImageUrl(img.blob); revoked = url; setImageUrl(url); }
      });
    }
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [object.imageId]);

  useEffect(() => {
    if (editing) textRef.current?.focus();
  }, [editing]);

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    const handle = e.currentTarget as HTMLElement;
    const pid = e.pointerId;
    handle.setPointerCapture(pid);
    const startX = e.clientX;
    const startW = object.width;
    const startH = object.height;
    const ratio = startW / startH;
    const move = (ev: PointerEvent) => {
      const w = Math.max(60, startW + (ev.clientX - startX) / zoom);
      updateObjectLocal(canvasId, object.id, { width: w, height: w / ratio });
    };
    const up = () => {
      handle.releasePointerCapture(pid);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      persist();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  };

  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    const handle = e.currentTarget as HTMLElement;
    const pid = e.pointerId;
    handle.setPointerCapture(pid);
    const rect = handle.parentElement!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const move = (ev: PointerEvent) => {
      const angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      updateObjectLocal(canvasId, object.id, { rotation: angle });
    };
    const up = () => {
      handle.releasePointerCapture(pid);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      persist();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  };

  const handleDouble = () => {
    if (object.nestedCanvasId) { onDoubleClick(); return; }
    if (['text', 'caption', 'note'].includes(object.type)) setEditing(true);
    else onDoubleClick();
  };

  const isTextish = object.type === 'note' || object.type === 'caption' || object.type === 'text';
  const detailOpacity = isTextish && zoom < 0.4 ? Math.max(0, (zoom - 0.22) / 0.18) : 1;

  const outline = object.outlineStyle ?? 'square';
  const edge = object.paperEdge ?? 'clean';
  const shadow = object.shadow ?? 'soft';

  // --- Non-paper decorative scraps render bare (no surface) ---
  const decorative = object.type === 'sticker' || object.type === 'doodle' || object.type === 'shape' || object.type === 'tape';

  const renderContent = () => {
    if (object.type === 'image') {
      return imageUrl
        ? <img src={imageUrl} alt={object.caption ?? 'scrap'} className="scrap-media" draggable={false}
               style={{ filter: FILTER_CSS[object.filter ?? 'none'] }} />
        : <div className="w-full h-full flex items-center justify-center text-peek-muted text-xs">…</div>;
    }
    if (object.type === 'note') {
      return (
        <div className="w-full h-full flex flex-col justify-center overflow-hidden">
          {object.caption && <div className="font-display font-semibold text-peek-ink text-[15px] mb-1 leading-tight">{object.caption}</div>}
          {editing
            ? <textarea ref={textRef} defaultValue={object.text}
                onBlur={(e) => { updateObject(canvasId, object.id, { text: e.target.value }); setEditing(false); }}
                className="scrap-textarea scrap-hand text-[17px]" />
            : object.text && <div className="scrap-hand text-[17px] whitespace-pre-line">{object.text}</div>}
        </div>
      );
    }
    if (object.type === 'text') {
      return editing
        ? <textarea ref={textRef} defaultValue={object.text}
            onBlur={(e) => { updateObject(canvasId, object.id, { text: e.target.value }); setEditing(false); }}
            className="scrap-textarea font-display font-semibold text-peek-ink"
            style={{ fontSize: Math.max(20, object.height * 0.5) }} />
        : <div className="w-full h-full flex items-center font-display font-semibold leading-tight whitespace-pre-line"
               style={{ color: object.color ?? '#3B3630', fontSize: Math.max(20, object.height * 0.5) }}>
            {object.text}
          </div>;
    }
    if (object.type === 'caption') {
      return editing
        ? <textarea ref={textRef} defaultValue={object.text}
            onBlur={(e) => { updateObject(canvasId, object.id, { text: e.target.value }); setEditing(false); }}
            className="scrap-textarea scrap-caption" />
        : <div className="w-full h-full flex items-center justify-center"><div className="scrap-caption whitespace-pre-line">{object.text || object.caption}</div></div>;
    }
    return null;
  };

  return (
    <motion.div
      className={`scrapbook-object ${isSelected ? 'selected' : ''}`}
      style={{ left: object.x, top: object.y, width: object.width, height: object.height, zIndex: object.zIndex }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: detailOpacity, scale: 1, rotate: object.rotation }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); handleDouble(); }}
    >
      {decorative ? (
        <StickerGraphic object={object} />
      ) : object.type === 'caption' || object.type === 'text' ? (
        // Floating text — no paper surface
        <div className={`w-full h-full shadow-${shadow === 'none' ? 'none' : 'text'}`}>
          {renderContent()}
        </div>
      ) : (
        <div className={`scrap-shadow shadow-${shadow}`}>
          <div className={`scrap-surface ${paperClassFor(object.paperStyle)} outline-${outline} edge-${edge}`}>
            {/* Tape */}
            {object.tapeStyle && object.tapeStyle !== 'none' && <div className={`tape tape-${object.tapeStyle === 'top' ? 'top' : object.tapeStyle}`} />}
            {renderContent()}
            {object.nestedCanvasId && <div className="portal-indicator" title="Double-click to peek inside" />}
          </div>
        </div>
      )}

      {/* Caption under a photo */}
      {object.caption && object.type === 'image' && (
        <div className="scrap-caption absolute left-0 right-0 -bottom-7 px-1">{object.caption}</div>
      )}

      {/* Portal indicator for decorative/text portals */}
      {object.nestedCanvasId && decorative && <div className="portal-indicator" />}

      {isSelected && (
        <>
          <div className="scrap-handle rotate" onPointerDown={startRotate} />
          <div className="scrap-handle resize" onPointerDown={startResize} />
        </>
      )}
    </motion.div>
  );
};
