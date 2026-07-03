/**
 * LeftToolbar — the collage creation rail. Pick a tool (Image, Text, Note,
 * Sticker, Tape, Doodle, Shape, Scan) to drop a new scrap at the canvas
 * center, browse decorative Elements, or upload an image.
 */
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ObjectType, StickerKind } from '@/types/scrapbook';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { defaultScrapForType, defaultImageScrap } from '@/utils/scrapFactory';
import { screenToCanvas } from '@/utils/canvasTransforms';
import { storeImage, getImageDimensions } from '@/utils/imageStorage';
import { generateId } from '@/utils/geometry';

type Tool = {
  type: Exclude<ObjectType, 'image' | 'portal'> | 'image' | 'scan';
  label: string;
  icon: React.ReactNode;
};

const I = (d: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const TOOLS: Tool[] = [
  { type: 'image', label: 'Image', icon: I(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M4 17l5-5 4 4 3-3 4 4" /></>) },
  { type: 'text', label: 'Text', icon: I(<><path d="M5 6h14" /><path d="M12 6v13" /></>) },
  { type: 'note', label: 'Note', icon: I(<><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 9h8M8 13h6" /></>) },
  { type: 'sticker', label: 'Sticker', icon: I(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6l6-6V5a2 2 0 0 0-2-2z" /><path d="M13 21v-4a2 2 0 0 1 2-2h4" /></>) },
  { type: 'tape', label: 'Tape', icon: I(<><rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(-8 12 12)" /></>) },
  { type: 'doodle', label: 'Doodle', icon: I(<><path d="M4 16c3-6 6 4 9-1s5-6 7-3" /></>) },
  { type: 'shape', label: 'Shape', icon: I(<><circle cx="9" cy="9" r="5" /><rect x="11" y="11" width="8" height="8" rx="1.5" /></>) },
  { type: 'scan', label: 'Scan', icon: I(<><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M4 12h16" /></>) },
];

const ELEMENTS: { kind: StickerKind; label: string; emoji: string }[] = [
  { kind: 'flower', label: 'Flower', emoji: '🌼' },
  { kind: 'pressed-flower', label: 'Pressed flower', emoji: '🌸' },
  { kind: 'star', label: 'Star', emoji: '✦' },
  { kind: 'heart', label: 'Heart', emoji: '♡' },
];

export const LeftToolbar: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const getCurrentCanvasId = useScrapbookStore((s) => s.getCurrentCanvasId);
  const getViewport = useScrapbookStore((s) => s.getViewport);
  const addObject = useScrapbookStore((s) => s.addObject);
  const selectObject = useScrapbookStore((s) => s.selectObject);

  const canvasCenter = (canvasId: string) => {
    const vp = getViewport(canvasId);
    return screenToCanvas(window.innerWidth / 2, window.innerHeight / 2, vp);
  };

  const placeScrap = (
    type: Exclude<ObjectType, 'image' | 'portal'>,
    kind?: StickerKind
  ) => {
    const canvasId = getCurrentCanvasId();
    if (!canvasId) return;
    const scrap = defaultScrapForType(type, canvasId, canvasCenter(canvasId), kind);
    const created = addObject(canvasId, scrap);
    selectObject(created.id);
  };

  const handleTool = (tool: Tool) => {
    if (tool.type === 'image' || tool.type === 'scan') {
      fileRef.current?.click();
      return;
    }
    placeScrap(tool.type as Exclude<ObjectType, 'image' | 'portal'>);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvasId = getCurrentCanvasId();
    if (!canvasId) return;
    const dims = await getImageDimensions(file);
    const imageId = generateId();
    await storeImage(imageId, file, dims.width, dims.height);
    const long = Math.max(dims.width, dims.height);
    const scale = Math.min(260 / long, 4);
    const w = Math.max(140, Math.round(dims.width * scale));
    const h = Math.max(100, Math.round(dims.height * scale));
    const created = addObject(canvasId, defaultImageScrap(canvasId, canvasCenter(canvasId), w, h, imageId));
    selectObject(created.id);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <motion.aside
      className="left-toolbar"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="lt-label">Add</div>
      <div className="lt-tools">
        {TOOLS.map((tool) => (
          <button key={tool.label} className="lt-tool" onClick={() => handleTool(tool)}>
            <span className="lt-tool-icon">{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="lt-label mt-5 flex items-center justify-between">
        <span>Elements</span>
      </div>
      <div className="lt-elements">
        {ELEMENTS.map((el) => (
          <button
            key={el.kind}
            className="lt-element"
            title={el.label}
            onClick={() => placeScrap('sticker', el.kind)}
          >
            <span className="text-xl leading-none">{el.emoji}</span>
          </button>
        ))}
      </div>

      <button className="lt-upload" onClick={() => fileRef.current?.click()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        Upload image
      </button>
    </motion.aside>
  );
};
