/**
 * EditPanel — the right-side "Edit your scrap" panel for the selected object.
 * Tabs: Crop, Outline, Shadow, Adjust, Filter — plus caption, nested memory,
 * and delete.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  OutlineStyle,
  PaperEdge,
  ShadowStyle,
  FilterStyle,
} from '@/types/scrapbook';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { retrieveImage, getImageUrl } from '@/utils/imageStorage';

type Tab = 'crop' | 'outline' | 'shadow' | 'adjust' | 'filter';

const Icon = (d: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'crop', label: 'Crop', icon: Icon(<><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M2 6h14a2 2 0 0 1 2 2v14" /></>) },
  { key: 'outline', label: 'Outline', icon: Icon(<rect x="4" y="4" width="16" height="16" rx="3" />) },
  { key: 'shadow', label: 'Shadow', icon: Icon(<><rect x="4" y="4" width="14" height="14" rx="2" /><path d="M8 20h12a0 0 0 0 0 0 0v-8" opacity="0.5" /></>) },
  { key: 'adjust', label: 'Adjust', icon: Icon(<><line x1="4" y1="8" x2="20" y2="8" /><circle cx="9" cy="8" r="2" fill="currentColor" /><line x1="4" y1="16" x2="20" y2="16" /><circle cx="15" cy="16" r="2" fill="currentColor" /></>) },
  { key: 'filter', label: 'Filter', icon: Icon(<><circle cx="9" cy="9" r="5" /><circle cx="15" cy="15" r="5" /></>) },
];

const OUTLINES: { key: OutlineStyle; render: string }[] = [
  { key: 'square', render: 'rounded-none' },
  { key: 'sticker', render: 'rounded-md' },
  { key: 'rounded', render: 'rounded-xl' },
  { key: 'circle', render: 'rounded-full' },
  { key: 'tag', render: 'rounded-md' },
];

const EDGES: PaperEdge[] = ['clean', 'torn', 'torn-top', 'torn-bottom', 'deckle', 'rough'];
const FILTERS: FilterStyle[] = ['none', 'warm', 'mono', 'faded', 'bright'];

const SwatchRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap gap-2">{children}</div>
);

export const EditPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('outline');
  const [nestLabel, setNestLabel] = useState('');
  const [showNest, setShowNest] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);

  const selectedId = useScrapbookStore((s) => s.selectedObjectId);
  const canvasId = useScrapbookStore((s) => s.getCurrentCanvasId());
  const canvas = useScrapbookStore((s) => s.getCurrentCanvas());
  const update = useScrapbookStore((s) => s.updateObject);
  const del = useScrapbookStore((s) => s.deleteObject);
  const deselect = useScrapbookStore((s) => s.deselectObject);
  const createNested = useScrapbookStore((s) => s.createNestedCanvas);
  const enterCanvas = useScrapbookStore((s) => s.enterCanvas);
  const bringForward = useScrapbookStore((s) => s.bringForward);
  const sendBackward = useScrapbookStore((s) => s.sendBackward);

  const obj = canvas?.objects.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    let revoked: string | null = null;
    if (obj?.imageId) {
      retrieveImage(obj.imageId).then((img) => {
        if (img) {
          const url = getImageUrl(img.blob);
          revoked = url;
          setThumb(url);
        }
      });
    } else {
      setThumb(null);
    }
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [obj?.imageId]);

  if (!obj || !canvasId || !selectedId) return null;
  const set = (u: Partial<typeof obj>) => update(canvasId, selectedId, u);
  const isImage = obj.type === 'image';

  const filterCss: Record<FilterStyle, string> = {
    none: 'none',
    warm: 'sepia(0.25) saturate(1.15) brightness(1.03)',
    mono: 'grayscale(1) contrast(1.05)',
    faded: 'contrast(0.9) brightness(1.08) saturate(0.8)',
    bright: 'brightness(1.12) saturate(1.2)',
  };

  return (
    <motion.aside
      className="edit-panel"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-peek-ink">Edit your scrap</h2>
        <button onClick={deselect} className="nav-icon-btn -mr-1" aria-label="Done">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="edit-preview">
        {isImage && thumb ? (
          <img src={thumb} alt="scrap" style={{ filter: filterCss[obj.filter ?? 'none'] }} />
        ) : (
          <div className="edit-preview-text scrap-hand">{obj.text || obj.caption || 'your scrap'}</div>
        )}
      </div>

      {/* Tabs */}
      <div className="edit-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`edit-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="edit-tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="edit-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {tab === 'crop' && (
              <div>
                <div className="edit-label">Aspect</div>
                <SwatchRow>
                  {([['Free', 0], ['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4]] as [string, number][]).map(([lbl, r]) => (
                    <button
                      key={lbl}
                      className="edit-chip"
                      onClick={() => r && set({ height: Math.round(obj.width / r) })}
                    >
                      {lbl}
                    </button>
                  ))}
                </SwatchRow>
              </div>
            )}

            {tab === 'outline' && (
              <>
                <div>
                  <div className="edit-label">Outline style</div>
                  <SwatchRow>
                    {OUTLINES.map((o) => (
                      <button
                        key={o.key}
                        className={`edit-outline ${o.render} ${obj.outlineStyle === o.key ? 'active' : ''}`}
                        onClick={() => set({ outlineStyle: o.key })}
                        title={o.key}
                      />
                    ))}
                  </SwatchRow>
                </div>
                <div>
                  <div className="edit-label">Paper edge</div>
                  <SwatchRow>
                    {EDGES.map((e) => (
                      <button
                        key={e}
                        className={`edit-edge edge-${e} ${obj.paperEdge === e ? 'active' : ''}`}
                        onClick={() => set({ paperEdge: e })}
                        title={e}
                      />
                    ))}
                  </SwatchRow>
                </div>
              </>
            )}

            {tab === 'shadow' && (
              <div>
                <div className="edit-label">Shadow</div>
                <SwatchRow>
                  {(['none', 'soft', 'lifted'] as ShadowStyle[]).map((s) => (
                    <button
                      key={s}
                      className={`edit-chip ${obj.shadow === s ? 'active' : ''}`}
                      onClick={() => set({ shadow: s })}
                    >
                      {s}
                    </button>
                  ))}
                </SwatchRow>
              </div>
            )}

            {tab === 'adjust' && (
              <div className="space-y-4">
                <div>
                  <div className="edit-label">Straighten</div>
                  <input
                    type="range" min={-30} max={30} step={1}
                    value={Math.round(obj.rotation)}
                    onChange={(e) => set({ rotation: Number(e.target.value) })}
                    className="edit-range"
                  />
                </div>
                <div>
                  <div className="edit-label">Layer</div>
                  <SwatchRow>
                    <button className="edit-chip" onClick={() => bringForward(canvasId, selectedId)}>↑ Front</button>
                    <button className="edit-chip" onClick={() => sendBackward(canvasId, selectedId)}>↓ Back</button>
                  </SwatchRow>
                </div>
              </div>
            )}

            {tab === 'filter' && (
              <div>
                <div className="edit-label">Filter</div>
                <SwatchRow>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`edit-chip ${(obj.filter ?? 'none') === f ? 'active' : ''}`}
                      onClick={() => set({ filter: f })}
                    >
                      {f}
                    </button>
                  ))}
                </SwatchRow>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div className="mt-1">
        <div className="edit-label">Add caption</div>
        <input
          value={obj.caption ?? ''}
          onChange={(e) => set({ caption: e.target.value })}
          placeholder="Write something…"
          className="edit-input font-hand text-lg"
        />
      </div>

      {/* Nested memory */}
      <div className="mt-4">
        {obj.nestedCanvasId ? (
          <button
            className="edit-chip w-full justify-center bg-peek-dustpink/40"
            onClick={() => enterCanvas(obj.nestedCanvasId!, obj.caption || obj.text || 'Memory')}
          >
            ✦ Peek inside
          </button>
        ) : showNest ? (
          <div className="space-y-2">
            <input
              autoFocus value={nestLabel}
              onChange={(e) => setNestLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nestLabel.trim()) {
                  const id = createNested(canvasId, selectedId, nestLabel.trim());
                  setShowNest(false); setNestLabel('');
                  enterCanvas(id, nestLabel.trim());
                }
              }}
              placeholder="Memory name…"
              className="edit-input"
            />
            <div className="flex gap-2">
              <button
                className="edit-chip flex-1 justify-center bg-peek-ink text-peek-paper"
                onClick={() => {
                  if (!nestLabel.trim()) return;
                  const id = createNested(canvasId, selectedId, nestLabel.trim());
                  setShowNest(false); setNestLabel('');
                  enterCanvas(id, nestLabel.trim());
                }}
              >
                Create & enter
              </button>
              <button className="edit-chip flex-1 justify-center" onClick={() => { setShowNest(false); setNestLabel(''); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="edit-chip w-full justify-center" onClick={() => setShowNest(true)}>
            ✦ Make it a portal
          </button>
        )}
      </div>

      {/* Done + delete */}
      <div className="mt-4 flex items-center gap-2">
        <button className="edit-done" onClick={deselect}>Done</button>
        <button
          className="edit-icon-btn"
          title="Remove scrap"
          onClick={() => { del(canvasId, selectedId); deselect(); }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </motion.aside>
  );
};
