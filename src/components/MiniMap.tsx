/**
 * MiniMap Component
 * Shows an overview of the entire canvas and current viewport
 */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useScrapbookStore } from '@/store/scrapbookStore';

interface Props {
  viewportWidth: number;
  viewportHeight: number;
  canvasSize: { width: number; height: number };
}

export const MiniMap: React.FC<Props> = ({
  viewportWidth,
  viewportHeight,
  canvasSize,
}) => {
  const canvasId = useScrapbookStore((state) => state.getCurrentCanvasId());
  const canvas = useScrapbookStore((state) => state.getCurrentCanvas());
  const viewport = useScrapbookStore((state) =>
    canvasId ? state.getViewport(canvasId) : { x: 0, y: 0, zoom: 1 }
  );
  const updateViewport = useScrapbookStore((state) => state.updateViewport);

  const minimapSize = { width: 150, height: 150 };
  const scale = useMemo(() => {
    const scaleX = minimapSize.width / canvasSize.width;
    const scaleY = minimapSize.height / canvasSize.height;
    return Math.min(scaleX, scaleY, 0.5);
  }, [canvasSize]);

  if (!canvas || !canvasId) return null;

  // Calculate viewport rect on minimap
  const viewportRectWidth = (viewportWidth / viewport.zoom) * scale;
  const viewportRectHeight = (viewportHeight / viewport.zoom) * scale;
  const viewportRectX = (-viewport.x / viewport.zoom) * scale;
  const viewportRectY = (-viewport.y / viewport.zoom) * scale;

  const handleMinimapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvasX = (x / scale - viewportWidth / (2 * viewport.zoom)) * viewport.zoom;
    const canvasY = (y / scale - viewportHeight / (2 * viewport.zoom)) * viewport.zoom;

    updateViewport(canvasId, {
      ...viewport,
      x: -canvasX * viewport.zoom + viewportWidth / 2,
      y: -canvasY * viewport.zoom + viewportHeight / 2,
    });
  };

  return (
    <motion.div
      className="mini-map"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onClick={handleMinimapClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="mini-map-content">
        {/* Objects */}
        {canvas.objects.map((obj) => (
          <div
            key={obj.id}
            className="mini-map-object"
            style={{
              left: `${obj.x * scale}px`,
              top: `${obj.y * scale}px`,
              width: `${obj.width * scale}px`,
              height: `${obj.height * scale}px`,
            }}
          />
        ))}

        {/* Viewport indicator */}
        <div
          className="mini-map-viewport"
          style={{
            left: `${Math.max(0, viewportRectX)}px`,
            top: `${Math.max(0, viewportRectY)}px`,
            width: `${viewportRectWidth}px`,
            height: `${viewportRectHeight}px`,
          }}
        />
      </div>
    </motion.div>
  );
};
