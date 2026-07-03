/**
 * ZoomControls — bottom-left. Zoom out/in + readout, fit-to-content, and a
 * (decorative) lock, styled as a single cozy pill.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { zoomTowardPoint } from '@/utils/canvasTransforms';

interface Props {
  viewportWidth: number;
  viewportHeight: number;
  canvasSize: { width: number; height: number };
}

export const ZoomControls: React.FC<Props> = ({ viewportWidth, viewportHeight }) => {
  const canvasId = useScrapbookStore((s) => s.getCurrentCanvasId());
  const viewport = useScrapbookStore((s) =>
    canvasId ? s.getViewport(canvasId) : { x: 0, y: 0, zoom: 1 }
  );
  const updateViewport = useScrapbookStore((s) => s.updateViewport);
  const resetViewport = useScrapbookStore((s) => s.resetViewport);

  if (!canvasId) return null;

  const zoomBy = (factor: number) => {
    updateViewport(
      canvasId,
      zoomTowardPoint(viewport, viewportWidth / 2, viewportHeight / 2, factor, 0.15, 4)
    );
  };

  return (
    <motion.div
      className="zoom-controls"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="zoom-pill">
        <button className="zoom-btn" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">−</button>
        <span className="zoom-readout">{Math.round(viewport.zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => zoomBy(1.2)} aria-label="Zoom in">+</button>
        <span className="zoom-divider" />
        <button className="zoom-btn" onClick={() => resetViewport(canvasId)} aria-label="Fit to content" title="Fit to content">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};
