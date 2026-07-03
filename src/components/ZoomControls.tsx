/**
 * ZoomControls — bottom-left. A cozy pill with zoom out/in + readout, and a
 * separate "Reset view" button.
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
    const next = zoomTowardPoint(viewport, viewportWidth / 2, viewportHeight / 2, factor, 0.15, 4);
    updateViewport(canvasId, next);
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
      </div>
      <button className="reset-view-btn" onClick={() => resetViewport(canvasId)}>
        Reset view
      </button>
    </motion.div>
  );
};
