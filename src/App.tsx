/**
 * App — Peek's single main screen: top nav, left creation rail, infinite
 * collage canvas, right edit panel (when a scrap is selected), zoom + minimap.
 */
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useScrapbookStore } from '@/store/scrapbookStore';
import {
  NestedCanvasTransition,
  LeftToolbar,
  EditPanel,
  TopNav,
  ZoomControls,
  MiniMap,
} from '@/components';

const CANVAS_SIZE = { width: 5000, height: 5000 };

function App() {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const project = useScrapbookStore((state) => state.project);
  const selectedObjectId = useScrapbookStore((state) => state.selectedObjectId);
  const initializeProject = useScrapbookStore((state) => state.initializeProject);
  const loadProjectFromStorage = useScrapbookStore((state) => state.loadProjectFromStorage);

  useEffect(() => {
    loadProjectFromStorage();
    if (!useScrapbookStore.getState().project) {
      initializeProject('Ateeq');
    }
    setMounted(true);
  }, [initializeProject, loadProjectFromStorage]);

  useEffect(() => {
    const handleResize = () =>
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted || !project) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-peek-canvas">
        <div className="text-center">
          <div className="font-display text-5xl font-semibold text-peek-ink mb-2">peek</div>
          <p className="font-hand text-2xl text-peek-brown/70">opening your scrapbook…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-peek-canvas">
      {/* Infinite collage canvas (with nested transitions) */}
      <NestedCanvasTransition />

      {/* Top navigation */}
      <TopNav />

      {/* Left creation rail */}
      <LeftToolbar />

      {/* Right edit panel — only when a scrap is selected */}
      <AnimatePresence>{selectedObjectId && <EditPanel key="edit" />}</AnimatePresence>

      {/* Zoom controls — bottom left */}
      <ZoomControls
        viewportWidth={viewportSize.width}
        viewportHeight={viewportSize.height}
        canvasSize={CANVAS_SIZE}
      />

      {/* Mini map — bottom right */}
      <MiniMap
        viewportWidth={viewportSize.width}
        viewportHeight={viewportSize.height}
        canvasSize={CANVAS_SIZE}
      />
    </div>
  );
}

export default App;
