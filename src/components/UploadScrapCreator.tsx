/**
 * UploadScrapCreator — the "Add to your peek" panel. Upload an image (or drop
 * one), pick a paper style + tape, add a caption, then place it on the canvas.
 */
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PaperStyle, TapeStyle } from '@/types/scrapbook';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { storeImage, getImageDimensions } from '@/utils/imageStorage';
import { generateId } from '@/utils/geometry';
import { screenToCanvas } from '@/utils/canvasTransforms';

interface Props {
  canvasId: string;
}

const PAPER_STYLES: { key: PaperStyle; label: string; swatch: string }[] = [
  { key: 'polaroid', label: 'Polaroid', swatch: '#fdfcf9' },
  { key: 'clean', label: 'Clean photo', swatch: '#f3ede0' },
  { key: 'ripped', label: 'Ripped', swatch: '#f0e7d5' },
  { key: 'kraft', label: 'Kraft', swatch: '#d3b483' },
  { key: 'journal', label: 'Journal', swatch: '#fbf7ee' },
];

const TAPES: { key: TapeStyle; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'top', label: 'Tape' },
  { key: 'tl', label: 'Corner' },
];

const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <polyline points="7 9 12 4 17 9" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);

export const UploadScrapCreator: React.FC<Props> = ({ canvasId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('polaroid');
  const [tapeStyle, setTapeStyle] = useState<TapeStyle>('top');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addObject = useScrapbookStore((s) => s.addObject);
  const selectObject = useScrapbookStore((s) => s.selectObject);
  const getViewport = useScrapbookStore((s) => s.getViewport);

  const loadFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDone = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const dims = await getImageDimensions(file);
      const imageId = generateId();
      await storeImage(imageId, file, dims.width, dims.height);

      // Drop the scrap near the center of the current viewport.
      const vp = getViewport(canvasId);
      const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2, vp);

      // Aim for a comfortable on-canvas size: scale the longest edge toward
      // ~240px, whether the source is large or tiny (never a hard-to-grab scrap).
      const targetLongEdge = 240;
      const longEdge = Math.max(dims.width, dims.height);
      const scale = Math.min(targetLongEdge / longEdge, 4);
      const width = Math.max(120, Math.round(dims.width * scale));
      const height = Math.max(90, Math.round(dims.height * scale));

      const created = addObject(canvasId, {
        type: 'image',
        canvasId,
        x: center.x - width / 2 + (Math.random() * 40 - 20),
        y: center.y - height / 2 + (Math.random() * 40 - 20),
        width,
        height,
        rotation: Math.random() * 6 - 3,
        zIndex: Date.now() % 100000,
        imageId,
        caption: caption.trim() || undefined,
        paperStyle,
        borderStyle: 'straight',
        tapeStyle,
      });
      selectObject(created.id);
      reset();
    } catch (err) {
      console.error('Failed to add scrap:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload / preview zone */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-peek-brown/15 bg-peek-paper">
            <img src={previewUrl} alt="Preview" className="w-full max-h-44 object-cover" />
            <button
              onClick={reset}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-peek-ink/70 text-peek-paper flex items-center justify-center hover:bg-peek-ink"
              aria-label="Remove image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) loadFile(f);
            }}
            className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-colors ${
              dragOver
                ? 'border-peek-brown bg-peek-beige/50'
                : 'border-peek-brown/30 hover:border-peek-brown/50 hover:bg-peek-beige/30'
            }`}
          >
            <span className="text-peek-brown"><UploadIcon /></span>
            <span className="text-sm text-peek-brown/80 text-center leading-snug">
              Upload image<br />or drag and drop
            </span>
          </button>
        )}
      </div>

      {/* Paper style */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
          Paper style
        </label>
        <div className="flex gap-2">
          {PAPER_STYLES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPaperStyle(p.key)}
              title={p.label}
              className={`w-10 h-10 rounded-lg border transition-all ${
                paperStyle === p.key
                  ? 'ring-2 ring-peek-ink border-peek-ink scale-105'
                  : 'border-peek-brown/20 hover:border-peek-brown/40'
              }`}
              style={{ background: p.swatch }}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
          Add caption
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write something…"
          className="w-full px-3 py-2.5 rounded-lg bg-peek-paper border border-peek-brown/15 text-sm text-peek-ink placeholder:text-peek-muted focus:outline-none focus:border-peek-brown/40 font-hand text-lg"
        />
      </div>

      {/* Tape / extras */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
          Tape
        </label>
        <div className="flex gap-2">
          {TAPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTapeStyle(t.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tapeStyle === t.key
                  ? 'bg-peek-ink text-peek-paper'
                  : 'bg-peek-beige/60 text-peek-brown hover:bg-peek-beige'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Done */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleDone}
        disabled={!file || busy}
        className="w-full py-3 rounded-xl bg-peek-ink text-peek-paper font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6z" />
        </svg>
        {busy ? 'Placing…' : 'Done'}
      </motion.button>
    </div>
  );
};
