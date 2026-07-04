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

export type ObjectType = 'image' | 'caption' | 'note' | 'sticker' | 'portal';

export type ThemeId = 'paper' | 'water' | 'grid' | 'fire' | 'romance' | 'meadow' | 'dream';

export type BackgroundType = 'theme' | 'color' | 'image';

export interface BackgroundImage {
  id?: string;
  url: string;
  width?: number;
  height?: number;
}

export interface ProjectBackground {
  type: BackgroundType;
  // when type === 'theme'
  themeId?: ThemeId;
  // when type === 'color'
  color?: string;
  // when type === 'image'
  image?: BackgroundImage;
}

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
  theme?: ThemeId;
  // Optional background object - replaces singular theme when present
  background?: ProjectBackground;
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
