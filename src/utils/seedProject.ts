/**
 * Builds a cozy starter Peek so the canvas feels alive on first open and
 * demonstrates the nested-memory mechanic without requiring uploads.
 */
import { Project, Canvas, ScrapbookObject } from '@/types/scrapbook';
import { generateId } from '@/utils/geometry';

// Canvas is 5000x5000; cluster memories around the middle.
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
    paperStyle: 'note',
    borderStyle: 'straight',
    tapeStyle: 'none',
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
  const concertsId = generateId();

  // ---- Home canvas ----
  const homeSeeds: SeedObj[] = [
    {
      type: 'caption',
      x: C - 760,
      y: C - 420,
      width: 200,
      height: 70,
      rotation: -4,
      text: 'the little things ♡',
    },
    {
      type: 'note',
      x: C - 780,
      y: C - 220,
      width: 150,
      height: 96,
      rotation: -3,
      paperStyle: 'note',
      text: 'morning coffee\nalways',
      tapeStyle: 'top',
    },
    {
      type: 'note',
      x: C - 300,
      y: C - 130,
      width: 240,
      height: 200,
      rotation: 1,
      paperStyle: 'journal',
      caption: 'june 2023',
      text: '✓ be present\n✓ go on more walks\n✓ take more photos\n✓ appreciate the\n   little things ♡',
    },
    {
      type: 'note',
      x: C - 760,
      y: C + 140,
      width: 210,
      height: 110,
      rotation: -2,
      paperStyle: 'note',
      text: 'girls weekend\nno phones, lots of\ntalking ♡',
      tapeStyle: 'top',
    },
    {
      // Portal → Concerts
      type: 'note',
      x: C + 140,
      y: C - 260,
      width: 190,
      height: 130,
      rotation: 3,
      paperStyle: 'kraft',
      caption: 'Concerts',
      text: 'lany • the 1975\nbillie • joji ♡',
      tapeStyle: 'tl',
      nestedCanvasId: concertsId,
    },
    {
      type: 'note',
      x: C + 120,
      y: C + 40,
      width: 200,
      height: 120,
      rotation: -2,
      paperStyle: 'ripped',
      caption: 'Summer in SF',
      text: 'ferry building\nbig sur • palm springs',
      tapeStyle: 'top',
    },
    {
      type: 'caption',
      x: C - 380,
      y: C + 300,
      width: 180,
      height: 60,
      rotation: -3,
      text: 'sf will always\nfeel like home',
    },
  ];

  // ---- Nested "Concerts" canvas ----
  const concertSeeds: SeedObj[] = [
    {
      type: 'caption',
      x: C - 260,
      y: C - 300,
      width: 220,
      height: 60,
      rotation: -3,
      text: 'best night ever ♡',
    },
    {
      type: 'note',
      x: C - 320,
      y: C - 140,
      width: 170,
      height: 110,
      rotation: -4,
      paperStyle: 'note',
      caption: 'The 1975',
      text: '4.12.22',
      tapeStyle: 'tl',
    },
    {
      type: 'note',
      x: C - 40,
      y: C - 160,
      width: 200,
      height: 130,
      rotation: 2,
      paperStyle: 'ripped',
      caption: 'LANY',
      text: '9.14.23 — GA\nlights, lyrics,\neverything ♡',
      tapeStyle: 'top',
    },
    {
      type: 'note',
      x: C + 200,
      y: C - 120,
      width: 160,
      height: 100,
      rotation: 3,
      paperStyle: 'kraft',
      caption: 'Billie Eilish',
      text: '6.3.23',
      tapeStyle: 'tr',
    },
    {
      type: 'note',
      x: C - 120,
      y: C + 90,
      width: 170,
      height: 100,
      rotation: -2,
      paperStyle: 'journal',
      caption: 'Joji',
      text: '11.20.21',
      tapeStyle: 'top',
    },
  ];

  const homeCanvas: Canvas = {
    id: homeId,
    name: 'Home',
    projectId,
    objects: homeSeeds.map((s, i) => makeObject(homeId, s, i + 1)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Find the concerts portal object so the nested canvas points back to it.
  const concertsPortal = homeCanvas.objects.find(
    (o) => o.nestedCanvasId === concertsId
  );

  const concertsCanvas: Canvas = {
    id: concertsId,
    name: 'Concerts',
    projectId,
    parentObjectId: concertsPortal?.id,
    objects: concertSeeds.map((s, i) => makeObject(concertsId, s, i + 1)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const project: Project = {
    id: projectId,
    name: `Peek into ${userName}`,
    userName,
    activeCanvasId: homeId,
    canvases: [homeCanvas, concertsCanvas],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { project, homeCanvasId: homeId };
}
