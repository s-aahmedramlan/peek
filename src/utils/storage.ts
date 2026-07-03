/**
 * LocalStorage utilities for projects and viewports
 */
import { Project, Canvas, ViewportState } from '@/types/scrapbook';

const PROJECT_KEY = 'peek_project_v2';
const VIEWPORT_KEY_PREFIX = 'peek_viewport_v2_';

/**
 * Save project to LocalStorage
 */
export function saveProject(project: Project): void {
  try {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
  } catch (error) {
    console.error('Failed to save project:', error);
  }
}

/**
 * Load project from LocalStorage
 */
export function loadProject(): Project | null {
  try {
    const data = localStorage.getItem(PROJECT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

/**
 * Clear project from LocalStorage
 */
export function clearProject(): void {
  try {
    localStorage.removeItem(PROJECT_KEY);
  } catch (error) {
    console.error('Failed to clear project:', error);
  }
}

/**
 * Save viewport state for a canvas
 */
export function saveViewport(canvasId: string, viewport: ViewportState): void {
  try {
    const key = `${VIEWPORT_KEY_PREFIX}${canvasId}`;
    localStorage.setItem(key, JSON.stringify(viewport));
  } catch (error) {
    console.error('Failed to save viewport:', error);
  }
}

/**
 * Load viewport state for a canvas
 */
export function loadViewport(canvasId: string): ViewportState | null {
  try {
    const key = `${VIEWPORT_KEY_PREFIX}${canvasId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load viewport:', error);
    return null;
  }
}

/**
 * Export project as JSON
 */
export function exportProjectAsJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Import project from JSON
 */
export function importProjectFromJson(json: string): Project | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to import project:', error);
    return null;
  }
}

/**
 * Download project as JSON file
 */
export function downloadProjectAsFile(project: Project, filename: string = 'peek-project.json'): void {
  const json = exportProjectAsJson(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
