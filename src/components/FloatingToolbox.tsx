/**
 * FloatingToolbox — right-side panel. Shows the "Add to your peek" creator
 * by default, or the selected-object editor when a scrap is selected.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { UploadScrapCreator } from './UploadScrapCreator';
import { ObjectToolbar } from './ObjectToolbar';

interface Props {
  /** Fallback canvas id; the toolbox always targets the current canvas. */
  canvasId: string;
}

export const FloatingToolbox: React.FC<Props> = () => {
  const currentCanvasId = useScrapbookStore((s) => s.getCurrentCanvasId());
  const selectedObjectId = useScrapbookStore((s) => s.selectedObjectId);
  const deselectObject = useScrapbookStore((s) => s.deselectObject);

  const canvasId = currentCanvasId ?? '';
  const showEditor = Boolean(selectedObjectId);

  return (
    <motion.div
      className="floating-toolbox"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-peek-ink">
          {showEditor ? 'Edit this scrap' : 'Add to your peek'}
        </h2>
        {showEditor && (
          <button
            onClick={deselectObject}
            className="nav-icon-btn -mr-1"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showEditor ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ObjectToolbar canvasId={canvasId} />
          </motion.div>
        ) : (
          <motion.div
            key="creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <UploadScrapCreator canvasId={canvasId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
