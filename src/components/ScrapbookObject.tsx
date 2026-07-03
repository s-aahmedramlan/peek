/**
 * ScrapbookObject — a single physical "scrap": photo, note, caption, or a
 * portal into a nested memory. Renders tactile paper, tape, and shadows.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrapbookObject as ScrapbookObjectType, PaperStyle } from '@/types/scrapbook';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { getImageUrl, retrieveImage } from '@/utils/imageStorage';

interface Props {
  object: ScrapbookObjectType;
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
  // 'note' is not a PaperStyle in the type but seeds use it; handled below.
} as Record<PaperStyle, string>;

function paperClassFor(style: string): string {
  return PAPER_CLASS[style as PaperStyle] ?? 'paper-note';
}

const TAPE_CLASS: Record<string, string[]> = {
  none: [],
  top: ['tape-top'],
  tl: ['tape-tl'],
  tr: ['tape-tr'],
  cross: ['tape-tl', 'tape-tr'],
  horizontal: ['tape-top'],
  vertical: ['tape-top'],
};

export const ScrapbookObject: React.FC<Props> = ({
  object,
  canvasId,
  isSelected,
  zoom,
  onDoubleClick,
  onPointerDown,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const updateObjectLocal = useScrapbookStore((s) => s.updateObjectLocal);
  const persist = useScrapbookStore((s) => s.persist);

  useEffect(() => {
    let revoked: string | null = null;
    if (object.imageId) {
      retrieveImage(object.imageId).then((img) => {
        if (img) {
          const url = getImageUrl(img.blob);
          revoked = url;
          setImageUrl(url);
        }
      });
    }
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [object.imageId]);

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
      const w = Math.max(80, startW + (ev.clientX - startX) / zoom);
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

  // Progressive detail: fade small text scraps out when zoomed far out.
  const isTextScrap = object.type === 'note' || object.type === 'caption';
  const detailOpacity = isTextScrap && zoom < 0.45 ? Math.max(0, (zoom - 0.25) / 0.2) : 1;

  const tapeClasses = TAPE_CLASS[object.tapeStyle] ?? [];
  const hasCaption = Boolean(object.caption) && object.type === 'image';

  return (
    <motion.div
      className={`scrapbook-object ${object.type === 'caption' ? 'paper-transparent' : paperClassFor(object.paperStyle)} ${isSelected ? 'selected' : ''}`}
      style={{
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        zIndex: object.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: detailOpacity, scale: 1, rotate: object.rotation }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
    >
      <div className="scrap-surface">
        {/* Tape overlays */}
        {tapeClasses.map((c) => (
          <div key={c} className={`tape ${c}`} />
        ))}

        {/* Image */}
        {object.type === 'image' && imageUrl && (
          <img src={imageUrl} alt={object.caption ?? 'scrap'} className="scrap-media" draggable={false} />
        )}
        {object.type === 'image' && !imageUrl && (
          <div className="w-full h-full flex items-center justify-center text-peek-muted text-xs">…</div>
        )}

        {/* Note: optional bold title + handwritten body */}
        {object.type === 'note' && (
          <div className="w-full h-full flex flex-col justify-center overflow-hidden">
            {object.caption && (
              <div className="font-display font-semibold text-peek-ink text-[15px] mb-1 leading-tight">
                {object.caption}
              </div>
            )}
            {object.text && (
              <div className="scrap-hand text-[17px] whitespace-pre-line">{object.text}</div>
            )}
          </div>
        )}

        {/* Caption-only scrap (floating handwriting, no paper) */}
        {object.type === 'caption' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="scrap-caption whitespace-pre-line">{object.text || object.caption}</div>
          </div>
        )}

        {/* Portal indicator */}
        {object.nestedCanvasId && <div className="portal-indicator" title="Peek inside" />}
      </div>

      {/* Caption under a photo */}
      {hasCaption && (
        <div className="scrap-caption absolute left-0 right-0 -bottom-7 px-1">
          {object.caption}
        </div>
      )}

      {/* Selection handles */}
      {isSelected && (
        <>
          <div className="scrap-handle rotate" onPointerDown={startRotate} />
          <div className="scrap-handle resize" onPointerDown={startResize} />
        </>
      )}
    </motion.div>
  );
};
