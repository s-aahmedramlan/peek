/**
 * StickerGraphic — renders decorative collage scraps (stickers, doodles,
 * shapes, tape) as inline SVG/text so they scale and recolor cleanly.
 */
import React from 'react';
import { ScrapbookObject } from '@/types/scrapbook';

export const StickerGraphic: React.FC<{ object: ScrapbookObject }> = ({ object }) => {
  const color = object.color ?? '#6F6355';
  const kind = object.kind ?? 'flower';

  if (object.type === 'tape') {
    return (
      <div className="w-full h-full tape-strip" style={{ background: color }} />
    );
  }

  if (object.type === 'shape') {
    if (kind === 'square') return <div className="w-full h-full" style={{ background: color, borderRadius: 6 }} />;
    if (kind === 'circle') return <div className="w-full h-full rounded-full" style={{ background: color }} />;
    // blob
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none">
        <path fill={color} d="M54 8c16-3 34 8 38 24s-6 33-18 44-31 18-45 11S8 62 9 45 20 15 34 10s6-0 20-2z" />
      </svg>
    );
  }

  if (object.type === 'doodle') {
    const stroke = { fill: 'none', stroke: color, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (kind === 'squiggle')
      return <svg viewBox="0 0 100 40" width="100%" height="100%"><path {...stroke} d="M4 20c8-14 16 14 24 0s16 14 24 0 16 14 24 0" /></svg>;
    if (kind === 'underline')
      return <svg viewBox="0 0 100 20" width="100%" height="100%"><path {...stroke} d="M4 12c20 6 72 6 92-2" /></svg>;
    if (kind === 'star')
      return <svg viewBox="0 0 100 100" width="100%" height="100%"><path fill={color} d="M50 6l11 30 32 1-25 20 9 31-27-18-27 18 9-31-25-20 32-1z" /></svg>;
    if (kind === 'heart')
      return <svg viewBox="0 0 100 100" width="100%" height="100%"><path fill={color} d="M50 86C24 66 10 52 10 34a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 18-14 32-40 52z" /></svg>;
    // arrow (default doodle)
    return (
      <svg viewBox="0 0 120 80" width="100%" height="100%">
        <path {...stroke} d="M8 60C30 20 70 8 108 26" />
        <path {...stroke} d="M96 12l14 12-18 8" />
      </svg>
    );
  }

  // sticker
  if (kind === 'star') return <svg viewBox="0 0 100 100" width="100%" height="100%"><path fill={color} d="M50 6l11 30 32 1-25 20 9 31-27-18-27 18 9-31-25-20 32-1z" /></svg>;
  if (kind === 'heart') return <div className="w-full h-full flex items-center justify-center text-peek-dustpink" style={{ fontSize: '3rem' }}>♡</div>;
  if (kind === 'pressed-flower')
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity="0.9">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="50" cy="30" rx="10" ry="20" fill="#E7D9C4" stroke="#C9B79A" strokeWidth="1"
              transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="9" fill="#D9BE86" />
        </g>
      </svg>
    );
  // flower (default sticker)
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="50" cy="28" rx="11" ry="20" fill="#F3E7CE" stroke="#D8C39C" strokeWidth="1.2"
            transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="11" fill="#E6C879" />
      </g>
    </svg>
  );
};
