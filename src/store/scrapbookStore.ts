/**
 * Zustand store for scrapbook state management
 */
import { create } from 'zustand';
import {
  Project,
  Canvas,
  ScrapbookObject,
  ViewportState,
  BreadcrumbItem,
} from '@/types/scrapbook';
import { generateId } from '@/utils/geometry';
import { buildSeedProject } from '@/utils/seedProject';
import { saveProject, loadProject, saveViewport, loadViewport } from '@/utils/storage';

const NAV_H = 60;

function windowSize() {
  return {
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  };
}

// Center the viewport on the middle of an empty canvas.
function centeredViewport(): ViewportState {
  const { w, h } = windowSize();
  return { x: w / 2 - 2500, y: h / 2 - 2500, zoom: 1 };
}

// Fit the viewport to a canvas's content bounds, leaving room for the nav
// and the right-side toolbox so every scrap is comfortably grabbable.
function fitViewport(objects: { x: number; y: number; width: number; height: number }[]): ViewportState {
  if (objects.length === 0) return centeredViewport();

  const minX = Math.min(...objects.map((o) => o.x));
  const minY = Math.min(...objects.map((o) => o.y));
  const maxX = Math.max(...objects.map((o) => o.x + o.width));
  const maxY = Math.max(...objects.map((o) => o.y + o.height));
  const bw = maxX - minX;
  const bh = maxY - minY;
  const cx = minX + bw / 2;
  const cy = minY + bh / 2;

  const { w, h } = windowSize();
  // Usable area: below the nav, left of the toolbox.
  const padX = 140;
  const padTop = NAV_H + 60;
  const padBottom = 80;
  const usableW = Math.max(320, w - 360 - padX); // reserve toolbox width
  const usableH = Math.max(320, h - padTop - padBottom);

  const zoom = Math.min(usableW / bw, usableH / bh, 1.1);
  const centerScreenX = padX / 2 + usableW / 2;
  const centerScreenY = padTop + usableH / 2;

  return { x: centerScreenX - cx * zoom, y: centerScreenY - cy * zoom, zoom };
}

interface ScrapbookStore {
  // State
  project: Project | null;
  selectedObjectId: string | null;
  viewportStates: Record<string, ViewportState>;
  breadcrumbs: BreadcrumbItem[];
  isCreatingScrap: boolean;
  editingObjectId: string | null;

  // Project actions
  initializeProject: (userName: string) => void;
  loadProjectFromStorage: () => void;

  // Canvas actions
  createNestedCanvas: (canvasId: string, parentObjectId: string, label: string) => string;
  enterCanvas: (canvasId: string, label?: string) => void;
  exitCanvas: () => void;
  resetToHome: () => void;
  getCurrentCanvasId: () => string | null;
  getCurrentCanvas: () => Canvas | null;

  // Object actions
  addObject: (canvasId: string, object: Omit<ScrapbookObject, 'id' | 'createdAt' | 'updatedAt'>) => ScrapbookObject;
  updateObject: (canvasId: string, objectId: string, updates: Partial<ScrapbookObject>) => void;
  /** Update an object in memory without persisting (use during live drag/resize). */
  updateObjectLocal: (canvasId: string, objectId: string, updates: Partial<ScrapbookObject>) => void;
  /** Persist the current project to storage (call once a live gesture ends). */
  persist: () => void;
  deleteObject: (canvasId: string, objectId: string) => void;
  selectObject: (objectId: string) => void;
  deselectObject: () => void;

  // Transform actions
  moveObject: (canvasId: string, objectId: string, x: number, y: number) => void;
  resizeObject: (canvasId: string, objectId: string, width: number, height: number) => void;
  rotateObject: (canvasId: string, objectId: string, rotation: number) => void;
  bringForward: (canvasId: string, objectId: string) => void;
  sendBackward: (canvasId: string, objectId: string) => void;

  // Viewport actions
  updateViewport: (canvasId: string, viewport: ViewportState) => void;
  resetViewport: (canvasId: string) => void;
  getViewport: (canvasId: string) => ViewportState;

  // UI state
  setIsCreatingScrap: (value: boolean) => void;
  setEditingObjectId: (id: string | null) => void;

  // Persistence
  saveState: () => void;
}

export const useScrapbookStore = create<ScrapbookStore>((set, get) => ({
  project: null,
  selectedObjectId: null,
  viewportStates: {},
  breadcrumbs: [],
  isCreatingScrap: false,
  editingObjectId: null,

  initializeProject: (userName: string) => {
    const { project, homeCanvasId } = buildSeedProject(userName);
    const home = centeredViewport();

    const viewportStates: Record<string, ViewportState> = {};
    project.canvases.forEach((c) => {
      viewportStates[c.id] = c.objects.length ? fitViewport(c.objects) : home;
    });

    set({
      project,
      breadcrumbs: [{ canvasId: homeCanvasId, label: 'Home' }],
      viewportStates,
    });

    saveProject(project);
  },

  loadProjectFromStorage: () => {
    const project = loadProject();
    if (project) {
      set({ project });
      const viewportStates: Record<string, ViewportState> = {};
      project.canvases.forEach((canvas) => {
        const viewport = loadViewport(canvas.id);
        viewportStates[canvas.id] =
          viewport || (canvas.objects.length ? fitViewport(canvas.objects) : centeredViewport());
      });
      set({ viewportStates });
    }
  },

  createNestedCanvas: (canvasId: string, parentObjectId: string, label: string) => {
    const newCanvasId = generateId();

    set((state) => {
      if (!state.project) return state;

      const newCanvas: Canvas = {
        id: newCanvasId,
        name: label,
        projectId: state.project.id,
        parentObjectId,
        objects: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Link the parent object to its new nested canvas in the same update
      const updatedProject = {
        ...state.project,
        canvases: [
          ...state.project.canvases.map((canvas) =>
            canvas.id === canvasId
              ? {
                  ...canvas,
                  objects: canvas.objects.map((obj) =>
                    obj.id === parentObjectId
                      ? { ...obj, nestedCanvasId: newCanvasId, updatedAt: Date.now() }
                      : obj
                  ),
                  updatedAt: Date.now(),
                }
              : canvas
          ),
          newCanvas,
        ],
      };

      saveProject(updatedProject);

      return { project: updatedProject };
    });

    return newCanvasId;
  },

  enterCanvas: (canvasId: string, label?: string) => {
    set((state) => {
      const newBreadcrumbs = [...state.breadcrumbs];
      
      // Check if we're already in this canvas
      const existingIndex = newBreadcrumbs.findIndex(b => b.canvasId === canvasId);
      if (existingIndex >= 0) {
        // Already in this canvas, trim breadcrumbs
        newBreadcrumbs.splice(existingIndex + 1);
      } else {
        // New canvas, add to breadcrumbs
        newBreadcrumbs.push({
          canvasId,
          label: label || 'Memory',
        });
      }

      return {
        breadcrumbs: newBreadcrumbs,
        selectedObjectId: null,
      };
    });
  },

  exitCanvas: () => {
    set((state) => {
      if (state.breadcrumbs.length <= 1) return state;

      const newBreadcrumbs = state.breadcrumbs.slice(0, -1);
      return {
        breadcrumbs: newBreadcrumbs,
        selectedObjectId: null,
      };
    });
  },

  resetToHome: () => {
    set((state) => ({
      breadcrumbs: state.breadcrumbs.slice(0, 1),
      selectedObjectId: null,
    }));
  },

  getCurrentCanvasId: () => {
    const state = get();
    const breadcrumbs = state.breadcrumbs;
    if (breadcrumbs.length === 0) return state.project?.canvases[0]?.id || null;
    return breadcrumbs[breadcrumbs.length - 1].canvasId;
  },

  getCurrentCanvas: () => {
    const state = get();
    if (!state.project) return null;

    const canvasId = get().getCurrentCanvasId();
    return state.project.canvases.find((c) => c.id === canvasId) || null;
  },

  addObject: (canvasId: string, objectData) => {
    let createdObject: ScrapbookObject | null = null;

    set((state) => {
      if (!state.project) return state;

      const newObject: ScrapbookObject = {
        ...objectData,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      createdObject = newObject;

      const updatedProject = {
        ...state.project,
        canvases: state.project.canvases.map((canvas) => {
          if (canvas.id === canvasId) {
            return {
              ...canvas,
              objects: [...canvas.objects, newObject],
              updatedAt: Date.now(),
            };
          }
          return canvas;
        }),
      };

      saveProject(updatedProject);

      return { project: updatedProject };
    });

    return createdObject!;
  },

  updateObject: (canvasId: string, objectId: string, updates) => {
    set((state) => {
      if (!state.project) return state;

      const updatedProject = {
        ...state.project,
        canvases: state.project.canvases.map((canvas) => {
          if (canvas.id === canvasId) {
            return {
              ...canvas,
              objects: canvas.objects.map((obj) => {
                if (obj.id === objectId) {
                  return {
                    ...obj,
                    ...updates,
                    updatedAt: Date.now(),
                  };
                }
                return obj;
              }),
              updatedAt: Date.now(),
            };
          }
          return canvas;
        }),
      };

      saveProject(updatedProject);

      return { project: updatedProject };
    });
  },

  updateObjectLocal: (canvasId, objectId, updates) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          canvases: state.project.canvases.map((canvas) =>
            canvas.id === canvasId
              ? {
                  ...canvas,
                  objects: canvas.objects.map((obj) =>
                    obj.id === objectId ? { ...obj, ...updates } : obj
                  ),
                }
              : canvas
          ),
        },
      };
    });
  },

  persist: () => {
    const state = get();
    if (state.project) saveProject(state.project);
  },

  deleteObject: (canvasId: string, objectId: string) => {
    set((state) => {
      if (!state.project) return state;

      const updatedProject = {
        ...state.project,
        canvases: state.project.canvases.map((canvas) => {
          if (canvas.id === canvasId) {
            return {
              ...canvas,
              objects: canvas.objects.filter((obj) => obj.id !== objectId),
              updatedAt: Date.now(),
            };
          }
          return canvas;
        }),
      };

      saveProject(updatedProject);

      return {
        project: updatedProject,
        selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId,
      };
    });
  },

  selectObject: (objectId: string) => {
    set({ selectedObjectId: objectId });
  },

  deselectObject: () => {
    set({ selectedObjectId: null });
  },

  moveObject: (canvasId: string, objectId: string, x: number, y: number) => {
    get().updateObject(canvasId, objectId, { x, y });
  },

  resizeObject: (canvasId: string, objectId: string, width: number, height: number) => {
    get().updateObject(canvasId, objectId, { width, height });
  },

  rotateObject: (canvasId: string, objectId: string, rotation: number) => {
    get().updateObject(canvasId, objectId, { rotation });
  },

  bringForward: (canvasId: string, objectId: string) => {
    set((state) => {
      if (!state.project) return state;

      const updatedProject = {
        ...state.project,
        canvases: state.project.canvases.map((canvas) => {
          if (canvas.id === canvasId) {
            const objects = [...canvas.objects];
            const objectIndex = objects.findIndex((obj) => obj.id === objectId);

            if (objectIndex >= 0 && objectIndex < objects.length - 1) {
              const maxZ = Math.max(...objects.map((obj) => obj.zIndex));
              objects[objectIndex].zIndex = maxZ + 1;
            }

            return { ...canvas, objects, updatedAt: Date.now() };
          }
          return canvas;
        }),
      };

      saveProject(updatedProject);

      return { project: updatedProject };
    });
  },

  sendBackward: (canvasId: string, objectId: string) => {
    set((state) => {
      if (!state.project) return state;

      const updatedProject = {
        ...state.project,
        canvases: state.project.canvases.map((canvas) => {
          if (canvas.id === canvasId) {
            const objects = [...canvas.objects];
            const objectIndex = objects.findIndex((obj) => obj.id === objectId);

            if (objectIndex > 0) {
              const minZ = Math.min(...objects.map((obj) => obj.zIndex));
              objects[objectIndex].zIndex = minZ - 1;
            }

            return { ...canvas, objects, updatedAt: Date.now() };
          }
          return canvas;
        }),
      };

      saveProject(updatedProject);

      return { project: updatedProject };
    });
  },

  updateViewport: (canvasId: string, viewport: ViewportState) => {
    set((state) => ({
      viewportStates: {
        ...state.viewportStates,
        [canvasId]: viewport,
      },
    }));
    saveViewport(canvasId, viewport);
  },

  resetViewport: (canvasId: string) => {
    const canvas = get().project?.canvases.find((c) => c.id === canvasId);
    get().updateViewport(canvasId, fitViewport(canvas?.objects ?? []));
  },

  getViewport: (canvasId: string) => {
    const state = get();
    if (state.viewportStates[canvasId]) return state.viewportStates[canvasId];
    const canvas = state.project?.canvases.find((c) => c.id === canvasId);
    return fitViewport(canvas?.objects ?? []);
  },

  setIsCreatingScrap: (value: boolean) => {
    set({ isCreatingScrap: value });
  },

  setEditingObjectId: (id: string | null) => {
    set({ editingObjectId: id });
  },

  saveState: () => {
    const state = get();
    if (state.project) {
      saveProject(state.project);
    }
  },
}));
