/**
 * NestedCanvasTransition Component
 * Handles smooth transitions when entering/exiting nested memories
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasViewport } from './CanvasViewport';
import { useScrapbookStore } from '@/store/scrapbookStore';

interface Props {}

export const NestedCanvasTransition: React.FC<Props> = () => {
  const [prevCanvasId, setPrevCanvasId] = useState<string | null>(null);
  const canvasId = useScrapbookStore((state) => state.getCurrentCanvasId());
  const breadcrumbs = useScrapbookStore((state) => state.breadcrumbs);
  const enterCanvas = useScrapbookStore((state) => state.enterCanvas);
  const exitCanvas = useScrapbookStore((state) => state.exitCanvas);

  const handleObjectDoubleClick = (objectId: string) => {
    const canvas = useScrapbookStore.getState().getCurrentCanvas();
    const object = canvas?.objects.find((obj) => obj.id === objectId);

    if (object?.nestedCanvasId) {
      enterCanvas(object.nestedCanvasId, object.caption || 'Memory');
    }
  };

  const handleEscape = () => {
    if (breadcrumbs.length > 1) {
      exitCanvas();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [breadcrumbs.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={canvasId}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <CanvasViewport onObjectDoubleClick={handleObjectDoubleClick} />
      </motion.div>
    </AnimatePresence>
  );
};
