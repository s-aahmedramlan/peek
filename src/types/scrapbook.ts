/**
 * Core types for the Peek scrapbook application
 */

export type PaperStyle = 'ripped' | 'polaroid' | 'journal' | 'kraft' | 'clean' | 'note';

export type BorderStyle = 'ripped' | 'straight' | 'wavy';

export type TapeStyle =
  | 'none'
  | 'top'
  | 'tl'
  | 'tr'
  | 'cross'
  | 'horizontal'
  | 'vertical';

export type ObjectType =
  | 'image'
  | 'caption'
  | 'text'
  | 'note'
  | 'sticker'
  | 'tape'
  | 'doodle'
  | 'shape'
  | 'portal';

/** White "sticker" cut around a scrap, mirrors the Outline styles in the panel. */
export type OutlineStyle = 'square' | 'sticker' | 'rounded' | 'circle' | 'tag';

/** Torn / deckled paper edge treatments. */
export type PaperEdge = 'clean' | 'torn' | 'torn-top' | 'torn-bottom' | 'deckle' | 'rough';

/** Drop-shadow depth to make a scrap feel lifted off the page. */
export type ShadowStyle = 'none' | 'soft' | 'lifted';

/** Photo filter presets. */
export type FilterStyle = 'none' | 'warm' | 'mono' | 'faded' | 'bright';

/** Decorative sticker / doodle / shape variants. */
export type StickerKind =
  | 'flower'
  | 'pressed-flower'
  | 'star'
  | 'heart'
  | 'arrow'
  | 'blob'
  | 'circle'
  | 'square'
  | 'squiggle'
  | 'underline';

export interface ScrapbookObject {
  id: string;
  type: ObjectType;
  canvasId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  imageId?: string;
  caption?: string;
  text?: string;
  paperStyle: PaperStyle;
  borderStyle: BorderStyle;
  tapeStyle: TapeStyle;
  // Editorial collage treatments
  outlineStyle?: OutlineStyle;
  paperEdge?: PaperEdge;
  shadow?: ShadowStyle;
  filter?: FilterStyle;
  /** Accent color for text / shapes / stickers / tape. */
  color?: string;
  /** Sticker / doodle / shape variant. */
  kind?: StickerKind;
  nestedCanvasId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Canvas {
  id: string;
  name: string;
  projectId: string;
  parentObjectId?: string;
  objects: ScrapbookObject[];
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  userName: string;
  activeCanvasId: string;
  canvases: Canvas[];
  createdAt: number;
  updatedAt: number;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface UploadImage {
  id: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  createdAt: number;
}

export type BreadcrumbItem = {
  canvasId: string;
  objectId?: string;
  label: string;
};
