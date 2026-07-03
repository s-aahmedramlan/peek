/**
 * Builds a cozy starter Peek — a layered magazine-collage of coffee-shop
 * memories that demonstrates nested "peek deeper" navigation:
 *   Ateeq's life → Coffee Shops → Blue Bottle SF → Currently Reading
 */
import { Project, Canvas, ScrapbookObject } from '@/types/scrapbook';
import { generateId } from '@/utils/geometry';

const C = 2500;

type SeedObj = Partial<ScrapbookObject> &
  Pick<ScrapbookObject, 'type' | 'x' | 'y' | 'width' | 'height'>;

function makeObject(canvasId: string, seed: SeedObj, z: number): ScrapbookObject {
  const now = Date.now();
  return {
    id: generateId(),
    canvasId,
    rotation: 0,
    zIndex: z,
    paperStyle: 'clean',
    borderStyle: 'straight',
    tapeStyle: 'none',
    shadow: 'soft',
    createdAt: now,
    updatedAt: now,
    ...seed,
  } as ScrapbookObject;
}

export function buildSeedProject(userName: string): {
  project: Project;
  homeCanvasId: string;
} {
  const projectId = generateId();
  const homeId = generateId();
  const shopsId = generateId();
  const blueBottleId = generateId();
  const readingId = generateId();

  // ---------- Level 0 · Home ----------
  const homeSeeds: SeedObj[] = [
    { type: 'text', x: C - 700, y: C - 360, width: 360, height: 70, rotation: -3, text: "ateeq's life", color: '#3B3630' },
    { type: 'caption', x: C - 690, y: C - 250, width: 240, height: 50, rotation: -2, text: 'a peek into everything ♡' },
    { type: 'note', x: C + 150, y: C - 300, width: 210, height: 150, rotation: 3, paperStyle: 'kraft', paperEdge: 'torn',
      caption: 'Coffee Shops', text: 'the little cafés\nthat feel like home ♡', tapeStyle: 'tl', nestedCanvasId: shopsId },
    { type: 'note', x: C - 260, y: C + 40, width: 200, height: 130, rotation: -2, paperStyle: 'note', paperEdge: 'torn',
      caption: 'Concerts', text: 'lany • the 1975\nbillie • joji', tapeStyle: 'top' },
    { type: 'note', x: C + 180, y: C + 80, width: 190, height: 120, rotation: 2, paperStyle: 'journal', paperEdge: 'deckle',
      caption: 'Travel', text: 'big sur • palm springs\nnew york ♡', tapeStyle: 'top' },
    { type: 'sticker', x: C - 360, y: C - 210, width: 84, height: 84, rotation: -6, kind: 'pressed-flower' },
    { type: 'caption', x: C - 300, y: C + 260, width: 220, height: 50, rotation: -3, text: 'wander slowly ♡' },
  ];

  // ---------- Level 1 · Coffee Shops ----------
  const shopsSeeds: SeedObj[] = [
    { type: 'text', x: C - 300, y: C - 320, width: 340, height: 96, rotation: -2, text: 'coffee\nshops', color: '#3B3630' },
    { type: 'note', x: C - 320, y: C - 60, width: 210, height: 150, rotation: -3, paperStyle: 'kraft', paperEdge: 'torn',
      caption: 'Blue Bottle SF', text: 'linden st ♡\nsunday mornings', tapeStyle: 'tl', nestedCanvasId: blueBottleId },
    { type: 'note', x: C + 20, y: C - 40, width: 190, height: 130, rotation: 2, paperStyle: 'note', paperEdge: 'deckle',
      caption: 'Sightglass', text: '7th street\nthe warm one', tapeStyle: 'top' },
    { type: 'note', x: C - 120, y: C + 150, width: 190, height: 120, rotation: -1, paperStyle: 'journal', paperEdge: 'torn',
      caption: 'Ritual', text: 'valencia st\ngood for reading', tapeStyle: 'top' },
    { type: 'sticker', x: C + 240, y: C - 220, width: 80, height: 80, rotation: 8, kind: 'flower' },
    { type: 'caption', x: C + 150, y: C + 190, width: 200, height: 46, rotation: 2, text: 'always a table ♡' },
  ];

  // ---------- Level 2 · Blue Bottle SF (the rich collage) ----------
  const blueBottleSeeds: SeedObj[] = [
    { type: 'caption', x: C - 250, y: C - 340, width: 200, height: 44, rotation: -4, text: 'sunday mornings' },
    { type: 'text', x: C - 260, y: C - 300, width: 380, height: 120, rotation: -2, text: 'blue bottle\nsan francisco', color: '#2C2A26' },
    { type: 'note', x: C - 300, y: C - 130, width: 170, height: 96, rotation: -3, paperStyle: 'note', paperEdge: 'torn',
      text: 'the best\niced latte. ♡', tapeStyle: 'none' },
    { type: 'note', x: C - 320, y: C + 20, width: 190, height: 110, rotation: 2, paperStyle: 'note', paperEdge: 'deckle',
      text: 'good coffee\nchanges\neverything ♡' },
    { type: 'note', x: C + 210, y: C - 150, width: 200, height: 200, rotation: 2, paperStyle: 'journal', paperEdge: 'torn',
      caption: 'BLUE BOTTLE COFFEE', text: '315 Linden St\nSan Francisco, CA\n\nIced Latte   $5.25\n\nthank you!' },
    { type: 'note', x: C + 250, y: C + 90, width: 180, height: 150, rotation: -1, paperStyle: 'kraft', paperEdge: 'deckle',
      caption: 'what I love here', text: '– the light\n– the people\n– the energy\n– the lattes ♡', tapeStyle: 'top' },
    { type: 'note', x: C - 40, y: C + 150, width: 170, height: 110, rotation: -2, paperStyle: 'journal', paperEdge: 'torn',
      caption: 'currently reading', text: 'sapiens ♡', tapeStyle: 'top', nestedCanvasId: readingId },
    { type: 'sticker', x: C - 360, y: C - 40, width: 90, height: 90, rotation: -8, kind: 'pressed-flower' },
    { type: 'sticker', x: C + 60, y: C - 300, width: 70, height: 70, rotation: 10, kind: 'flower' },
    { type: 'doodle', x: C + 120, y: C - 40, width: 120, height: 80, rotation: 0, kind: 'arrow', color: '#6F6355' },
  ];

  // ---------- Level 3 · Currently Reading ----------
  const readingSeeds: SeedObj[] = [
    { type: 'text', x: C - 200, y: C - 240, width: 320, height: 70, rotation: -2, text: 'currently reading', color: '#3B3630' },
    { type: 'note', x: C - 200, y: C - 120, width: 200, height: 240, rotation: -3, paperStyle: 'kraft', paperEdge: 'deckle',
      caption: 'Sapiens', text: 'A Brief History\nof Humankind\n\nYuval Noah Harari', tapeStyle: 'top' },
    { type: 'note', x: C + 90, y: C - 60, width: 190, height: 130, rotation: 3, paperStyle: 'note', paperEdge: 'torn',
      text: '“we are the only\nanimal that believes\nin stories” ♡' },
    { type: 'sticker', x: C + 150, y: C + 120, width: 80, height: 80, rotation: 6, kind: 'pressed-flower' },
    { type: 'caption', x: C - 180, y: C + 170, width: 220, height: 46, rotation: -2, text: 'read it twice ♡' },
  ];

  const canvas = (id: string, name: string, seeds: SeedObj[], parentObjectId?: string): Canvas => ({
    id,
    name,
    projectId,
    parentObjectId,
    objects: seeds.map((s, i) => makeObject(id, s, i + 1)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const homeCanvas = canvas(homeId, 'Home', homeSeeds);
  const shopsCanvas = canvas(shopsId, 'Coffee Shops', shopsSeeds,
    homeCanvas.objects.find((o) => o.nestedCanvasId === shopsId)?.id);
  const blueBottleCanvas = canvas(blueBottleId, 'Blue Bottle SF', blueBottleSeeds,
    shopsCanvas.objects.find((o) => o.nestedCanvasId === blueBottleId)?.id);
  const readingCanvas = canvas(readingId, 'Currently Reading', readingSeeds,
    blueBottleCanvas.objects.find((o) => o.nestedCanvasId === readingId)?.id);

  const project: Project = {
    id: projectId,
    name: `Peek into ${userName}`,
    userName,
    activeCanvasId: homeId,
    canvases: [homeCanvas, shopsCanvas, blueBottleCanvas, readingCanvas],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { project, homeCanvasId: homeId };
}
