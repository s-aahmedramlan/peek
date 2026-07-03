/**
 * ObjectToolbar — editor for the currently selected scrap: layering, nested
 * memory (peek inside), and delete.
 */
import React, { useState } from 'react';
import { useScrapbookStore } from '@/store/scrapbookStore';

interface Props {
  canvasId: string;
}

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'soft' | 'dark' | 'pink' | 'danger' }> = ({
  tone = 'soft',
  className = '',
  ...props
}) => {
  const tones: Record<string, string> = {
    soft: 'bg-peek-beige/60 text-peek-brown hover:bg-peek-beige',
    dark: 'bg-peek-ink text-peek-paper hover:opacity-90',
    pink: 'bg-peek-dustpink text-peek-ink hover:opacity-90',
    danger: 'bg-transparent text-peek-brown/70 hover:text-peek-ink hover:bg-peek-beige/50',
  };
  return (
    <button
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    />
  );
};

export const ObjectToolbar: React.FC<Props> = ({ canvasId }) => {
  const selectedObjectId = useScrapbookStore((s) => s.selectedObjectId);
  const project = useScrapbookStore((s) => s.project);
  const deleteObject = useScrapbookStore((s) => s.deleteObject);
  const createNestedCanvas = useScrapbookStore((s) => s.createNestedCanvas);
  const enterCanvas = useScrapbookStore((s) => s.enterCanvas);
  const bringForward = useScrapbookStore((s) => s.bringForward);
  const sendBackward = useScrapbookStore((s) => s.sendBackward);
  const deselectObject = useScrapbookStore((s) => s.deselectObject);
  const updateObject = useScrapbookStore((s) => s.updateObject);

  const [showNestForm, setShowNestForm] = useState(false);
  const [label, setLabel] = useState('');

  if (!selectedObjectId || !project) return null;
  const canvas = project.canvases.find((c) => c.id === canvasId);
  const obj = canvas?.objects.find((o) => o.id === selectedObjectId);
  if (!obj) return null;

  const createNested = () => {
    const title = label.trim();
    if (!title) return;
    const newId = createNestedCanvas(canvasId, selectedObjectId, title);
    setShowNestForm(false);
    setLabel('');
    enterCanvas(newId, title);
  };

  const enterNested = () => {
    if (obj.nestedCanvasId) enterCanvas(obj.nestedCanvasId, obj.caption || obj.text || 'Memory');
  };

  const handleDelete = () => {
    deleteObject(canvasId, selectedObjectId);
    deselectObject();
  };

  return (
    <div className="space-y-4">
      {/* Caption edit for images */}
      {obj.type === 'image' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
            Caption
          </label>
          <input
            value={obj.caption ?? ''}
            onChange={(e) => updateObject(canvasId, selectedObjectId, { caption: e.target.value })}
            placeholder="Write something…"
            className="w-full px-3 py-2.5 rounded-lg bg-peek-paper border border-peek-brown/15 text-lg font-hand text-peek-ink placeholder:text-peek-muted focus:outline-none focus:border-peek-brown/40"
          />
        </div>
      )}

      {/* Layering */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
          Arrange
        </label>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={() => bringForward(canvasId, selectedObjectId)}>↑ Front</Btn>
          <Btn className="flex-1" onClick={() => sendBackward(canvasId, selectedObjectId)}>↓ Back</Btn>
        </div>
      </div>

      {/* Nested memory */}
      <div className="pt-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-peek-brown/70 mb-2">
          Nested memory
        </label>
        {obj.nestedCanvasId ? (
          <Btn tone="pink" className="w-full" onClick={enterNested}>
            ✦ Peek inside
          </Btn>
        ) : !showNestForm ? (
          <Btn tone="pink" className="w-full" onClick={() => setShowNestForm(true)}>
            ✦ Add a peek inside
          </Btn>
        ) : (
          <div className="space-y-2">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNested()}
              placeholder="Memory name…"
              className="w-full px-3 py-2 rounded-lg bg-peek-paper border border-peek-brown/15 text-sm focus:outline-none focus:border-peek-brown/40"
            />
            <div className="flex gap-2">
              <Btn tone="dark" className="flex-1" onClick={createNested} disabled={!label.trim()}>
                Create & enter
              </Btn>
              <Btn className="flex-1" onClick={() => { setShowNestForm(false); setLabel(''); }}>
                Cancel
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="pt-2 border-t border-peek-brown/10">
        <Btn tone="danger" className="w-full" onClick={handleDelete}>
          🗑 Remove scrap
        </Btn>
      </div>
    </div>
  );
};
