/**
 * Default scrap definitions for each creation tool. Given a canvas + a drop
 * point (in canvas coordinates) it returns the object props ready for addObject.
 */
import { ObjectType, ScrapbookObject, StickerKind } from '@/types/scrapbook';

export type NewScrap = Omit<ScrapbookObject, 'id' | 'createdAt' | 'updatedAt'>;

const jitter = () => Math.random() * 5 - 2.5;

export function defaultScrapForType(
  type: Exclude<ObjectType, 'image' | 'portal'>,
  canvasId: string,
  center: { x: number; y: number },
  kind?: StickerKind
): NewScrap {
  const base = {
    canvasId,
    zIndex: Date.now() % 100000,
    rotation: jitter(),
    paperStyle: 'clean' as const,
    borderStyle: 'straight' as const,
    tapeStyle: 'none' as const,
    shadow: 'soft' as const,
  };

  const at = (w: number, h: number) => ({
    x: center.x - w / 2,
    y: center.y - h / 2,
    width: w,
    height: h,
  });

  switch (type) {
    case 'text':
      return {
        ...base, ...at(260, 64), type,
        text: 'double click to edit',
        paperStyle: 'clean', shadow: 'none',
        color: '#3B3630',
      };
    case 'caption':
      return {
        ...base, ...at(220, 60), type,
        text: 'a little note ♡',
        paperStyle: 'clean', shadow: 'none',
        color: '#4A4238',
      };
    case 'note':
      return {
        ...base, ...at(200, 140), type,
        caption: '', text: 'write something…',
        paperStyle: 'note', paperEdge: 'torn', shadow: 'soft', tapeStyle: 'top',
      };
    case 'sticker':
      return { ...base, ...at(90, 90), type, kind: kind ?? 'flower', shadow: 'none' };
    case 'tape':
      return { ...base, ...at(130, 42), type, rotation: -4 + jitter(), color: '#E2D6BB', shadow: 'none' };
    case 'doodle':
      return { ...base, ...at(140, 90), type, kind: kind ?? 'arrow', color: '#6F6355', shadow: 'none' };
    case 'shape':
      return { ...base, ...at(120, 120), type, kind: kind ?? 'blob', color: '#D6B2A8', shadow: 'soft' };
    default:
      return { ...base, ...at(180, 120), type: 'note' };
  }
}

export function defaultImageScrap(
  canvasId: string,
  center: { x: number; y: number },
  width: number,
  height: number,
  imageId: string,
  caption?: string
): NewScrap {
  return {
    canvasId,
    type: 'image',
    x: center.x - width / 2 + jitter() * 6,
    y: center.y - height / 2 + jitter() * 6,
    width,
    height,
    rotation: jitter(),
    zIndex: Date.now() % 100000,
    imageId,
    caption: caption || undefined,
    paperStyle: 'clean',
    borderStyle: 'straight',
    tapeStyle: 'none',
    outlineStyle: 'sticker',
    paperEdge: 'torn',
    shadow: 'lifted',
    filter: 'none',
  };
}
