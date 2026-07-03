/**
 * CanvasViewport — the infinite scrapbook canvas. Handles panning empty space,
 * cursor-anchored wheel zoom, and dragging/selecting scraps.
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScrapbookObject } from './ScrapbookObject';
import { useScrapbookStore } from '@/store/scrapbookStore';
import { pan, zoomTowardPoint } from '@/utils/canvasTransforms';

interface Props {
  onObjectDoubleClick?: (objectId: string) => void;
}

const CANVAS_SIZE = { width: 5000, height: 5000 };

export const CanvasViewport: React.FC<Props> = ({ onObjectDoubleClick }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panState = useRef<{ x: number; y: number } | null>(null);

  const canvasId = useScrapbookStore((s) => s.getCurrentCanvasId());
  const canvas = useScrapbookStore((s) => s.getCurrentCanvas());
  const viewport = useScrapbookStore((s) =>
    canvasId ? s.getViewport(canvasId) : { x: 0, y: 0, zoom: 1 }
  );
  const selectedObjectId = useScrapbookStore((s) => s.selectedObjectId);
  const selectObject = useScrapbookStore((s) => s.selectObject);
  const deselectObject = useScrapbookStore((s) => s.deselectObject);
  const updateViewport = useScrapbookStore((s) => s.updateViewport);
  const updateObjectLocal = useScrapbookStore((s) => s.updateObjectLocal);
  const persist = useScrapbookStore((s) => s.persist);

  // --- Panning empty space ---
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const t = e.target as HTMLElement;
      if (t.closest('.scrapbook-object')) return; // let the scrap handle it
      setIsPanning(true);
      panState.current = { x: e.clientX, y: e.clientY };
      deselectObject();
    },
    [deselectObject]
  );

  useEffect(() => {
    if (!isPanning) return;
    const move = (e: MouseEvent) => {
      if (!panState.current || !canvasId) return;
      const dx = e.clientX - panState.current.x;
      const dy = e.clientY - panState.current.y;
      panState.current = { x: e.clientX, y: e.clientY };
      updateViewport(canvasId, pan(useScrapbookStore.getState().getViewport(canvasId), dx, dy));
    };
    const up = () => {
      setIsPanning(false);
      panState.current = null;
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [isPanning, canvasId, updateViewport]);

  // --- Cursor-anchored wheel zoom (and trackpad pan) ---
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!canvasId || !viewportRef.current) return;
      e.preventDefault();
      const rect = viewportRef.current.getBoundingClientRect();
      const vp = useScrapbookStore.getState().getViewport(canvasId);

      if (e.ctrlKey) {
        // pinch-zoom gesture
        const factor = Math.exp(-e.deltaY * 0.01);
        updateViewport(canvasId, zoomTowardPoint(vp, e.clientX - rect.left, e.clientY - rect.top, factor, 0.15, 4));
      } else {
        const factor = e.deltaY > 0 ? 1 / 1.12 : 1.12;
        updateViewport(canvasId, zoomTowardPoint(vp, e.clientX - rect.left, e.clientY - rect.top, factor, 0.15, 4));
      }
    },
    [canvasId, updateViewport]
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // --- Dragging a scrap (pointer-capture based, persist on release) ---
  const handleObjectPointerDown = useCallback(
    (e: React.PointerEvent, objectId: string) => {
      if (!canvasId || e.button !== 0) return;
      if ((e.target as HTMLElement).classList.contains('scrap-handle')) return; // resize/rotate
      e.stopPropagation();
      selectObject(objectId);

      const el = e.currentTarget as HTMLElement;
      const pointerId = e.pointerId;
      el.setPointerCapture(pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      const vp = useScrapbookStore.getState().getViewport(canvasId);
      const obj = useScrapbookStore
        .getState()
        .getCurrentCanvas()
        ?.objects.find((o) => o.id === objectId);
      if (!obj) return;
      const startObjX = obj.x;
      const startObjY = obj.y;
      let moved = false;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 3) return; // click threshold
        moved = true;
        updateObjectLocal(canvasId, objectId, {
          x: startObjX + dx / vp.zoom,
          y: startObjY + dy / vp.zoom,
        });
      };
      const up = () => {
        el.releasePointerCapture(pointerId);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        if (moved) persist();
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    },
    [canvasId, selectObject, updateObjectLocal, persist]
  );

  if (!canvas) return null;

  return (
    <div
      ref={viewportRef}
      className={`canvas-viewport ${isPanning ? 'dragging' : ''}`}
      onMouseDown={handleCanvasMouseDown}
    >
      <div
        className="canvas-container paper-grain"
        style={{
          width: CANVAS_SIZE.width,
          height: CANVAS_SIZE.height,
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
        }}
      >
        <AnimatePresence>
          {canvas.objects.map((object) => (
            <ScrapbookObject
              key={object.id}
              object={object}
              canvasId={canvas.id}
              isSelected={selectedObjectId === object.id}
              zoom={viewport.zoom}
              onDoubleClick={() => onObjectDoubleClick?.(object.id)}
              onPointerDown={(e) => handleObjectPointerDown(e, object.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
