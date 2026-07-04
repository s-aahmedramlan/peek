/**
 * ThemePicker — palette button in the nav that opens a popover of cute
 * background themes (water, grid, fire, romance, ...) for the canvas.
 */
import React, { useEffect, useRef, useState } from 'react';
import { THEMES } from '@/utils/themes';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { getImageDimensions, storeImage } from '@/utils/imageStorage';
import { generateId } from '@/utils/geometry';
import { screenToCanvas } from '@/utils/canvasTransforms';
import { PaperStyle, TapeStyle } from '@/types/scrapbook';

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-.95-.5-1.3-.3-.35-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c1.5 0 2.6-1.3 2.6-2.8C20 6.8 16.4 3 12 3Z" />
    <circle cx="7.2" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const ThemePicker: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);

  const theme = useScrapbookStore((s) => s.project?.theme ?? 'paper');
  const setTheme = useScrapbookStore((s) => s.setTheme);
  const setBackgroundColor = useScrapbookStore((s) => s.setBackgroundColor);
  const setBackgroundImage = useScrapbookStore((s) => s.setBackgroundImage);
  const project = useScrapbookStore((s) => s.project);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // no-op: we intentionally don't expose previous uploads for now

  return (
    <div className="relative" ref={rootRef}>
      <button
        className="nav-icon-btn"
        aria-label="Change background theme"
        onClick={() => setOpen((v) => !v)}
      >
        <PaletteIcon />
      </button>

      {open && (
        <div className="theme-picker-popover">
          <div className="text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-3">Themes</div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                title={t.label}
                aria-label={t.label}
                className={`theme-swatch-btn ${theme === t.id ? 'active' : ''}`}
                style={{ background: t.swatch }}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
              >
                <span className="text-sm">{t.emoji}</span>
                <div className="text-[10px] mt-1">{t.label}</div>
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">Colors</div>
          <div className="flex items-center gap-2 mb-3">
            <input
              aria-label="Pick background color"
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                setOpen(false);
              }}
            />
            {/* quick presets */}
            {['#ffffff', '#f8f4ee', '#f1e8ff', '#e8f7ff', '#fff0f0', '#f0fff4'].map((c) => (
              <button
                key={c}
                aria-label={`Use color ${c}`}
                className="w-7 h-7 rounded"
                style={{ backgroundColor: c, border: '1px solid rgba(0,0,0,0.06)' }}
                onClick={() => {
                  setBackgroundColor(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">Upload</div>
          <div className="flex items-center gap-2 mb-3">
            <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
              Upload image
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                // clear custom background and revert to paper
                setBackgroundImage(null);
                setTheme('paper');
                setOpen(false);
              }}
            >
              Reset
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;

              const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
              const MIN_LONG_SIDE = 1600; // recommended minimum
              const MAX_LONG_SIDE = 8192; // cap for uploads

              if (f.size > MAX_FILE_SIZE) {
                window.alert('File is too large — max 20 MB.');
                return;
              }

              const originalUrl = URL.createObjectURL(f);

              try {
                const img = await new Promise<HTMLImageElement>((res, rej) => {
                  const i = new Image();
                  i.onload = () => res(i);
                  i.onerror = rej;
                  i.src = originalUrl;
                });

                const longSide = Math.max(img.width, img.height);
                if (longSide < MIN_LONG_SIDE) {
                  window.alert(
                    `Image is too small — longest side should be at least ${MIN_LONG_SIDE}px for good quality.`
                  );
                  URL.revokeObjectURL(originalUrl);
                  return;
                }

                // Compute target size (downscale only)
                const scale = Math.min(1, MAX_LONG_SIDE / longSide);
                const targetW = Math.round(img.width * scale);
                const targetH = Math.round(img.height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get canvas context');
                // draw with smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, targetW, targetH);

                // Transcode to WebP for better compression/quality in modern browsers
                const blob: Blob | null = await new Promise((resolve) =>
                  // quality 0.85 is a good default
                  canvas.toBlob((b) => resolve(b), 'image/webp', 0.85)
                );

                if (!blob) throw new Error('Failed to encode image');

                const blobUrl = URL.createObjectURL(blob);
                const id = String(Date.now());
                setBackgroundImage({ url: blobUrl, width: targetW, height: targetH, id });
                setOpen(false);
                // release original file URL
                URL.revokeObjectURL(originalUrl);
              } catch (err) {
                console.error(err);
                window.alert('Failed to process image.');
                URL.revokeObjectURL(originalUrl);
              }
            }}
          />

          <div className="text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">Design Online</div>
          <div className="flex items-center gap-2 mb-3">
            <a
              href="https://www.figma.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
              title="Design at Figma"
            >
              {/* Figma Logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="2.5" fill="#9D5BD2" />
                <circle cx="17" cy="12" r="2.5" fill="#F24E1E" />
                <circle cx="12" cy="18" r="2.5" fill="#0ACF83" />
                <circle cx="7" cy="12" r="2.5" fill="#1ABCFE" />
                <circle cx="12" cy="12" r="2.5" fill="#A259FF" />
              </svg>
              Figma
            </a>
            <a
              href="https://www.canva.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
              title="Design at Canva"
            >
              {/* Canva Logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 3C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5H8zm2 4h6v8H10V7z" fill="#3B57FF" />
              </svg>
              Canva
            </a>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">Paste Design URL</div>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              placeholder="https://..."
              className="input input-bordered input-sm flex-1 text-xs"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setLoadingUrl(true);
                  handleLoadExternalImage(externalUrl, setBackgroundImage, setOpen).finally(() => setLoadingUrl(false));
                }
              }}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setLoadingUrl(true);
                handleLoadExternalImage(externalUrl, setBackgroundImage, setOpen).finally(() => setLoadingUrl(false));
              }}
              disabled={loadingUrl}
            >
              {loadingUrl ? 'Loading...' : 'Apply'}
            </button>
          </div>

          {/* Previous uploads intentionally hidden for now */}
        </div>
      )}
    </div>
  );
};

const handleLoadExternalImage = async (
  url: string,
  setBackgroundImage: (img: any) => void,
  setOpen: (v: boolean) => void
): Promise<void> => {
  if (!url.trim()) {
    window.alert('Please enter a valid URL.');
    return;
  }

  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.crossOrigin = 'anonymous'; // attempt CORS
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Failed to load image from URL'));
      i.src = url;
    });

    const longSide = Math.max(img.width, img.height);
    if (longSide < 1600) {
      window.alert('Image is too small — recommended minimum 1600px on longest side.');
      return;
    }

    setBackgroundImage({ url, width: img.width, height: img.height, id: String(Date.now()) });
    setOpen(false);
  } catch (err) {
    console.error(err);
    window.alert('Failed to load image from URL. Ensure the URL is valid and accessible.');
  }
};
