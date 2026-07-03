/**
 * Canvas transform utilities for viewport calculations
 */

export interface Transform {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  transform: Transform
): { x: number; y: number } {
  return {
    x: (screenX - transform.x) / transform.zoom,
    y: (screenY - transform.y) / transform.zoom,
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  transform: Transform
): { x: number; y: number } {
  return {
    x: canvasX * transform.zoom + transform.x,
    y: canvasY * transform.zoom + transform.y,
  };
}

/**
 * Get a transform that centers a given rect on screen
 */
export function fitRectInViewport(
  canvasRect: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50
): Transform {
  const targetWidth = canvasRect.width + padding * 2;
  const targetHeight = canvasRect.height + padding * 2;

  const zoomX = viewportWidth / targetWidth;
  const zoomY = viewportHeight / targetHeight;
  const zoom = Math.min(zoomX, zoomY);

  const x = viewportWidth / 2 - (canvasRect.x + canvasRect.width / 2) * zoom;
  const y = viewportHeight / 2 - (canvasRect.y + canvasRect.height / 2) * zoom;

  return { x, y, zoom };
}

/**
 * Zoom toward a point
 */
export function zoomTowardPoint(
  currentTransform: Transform,
  centerScreenX: number,
  centerScreenY: number,
  zoomFactor: number,
  minZoom: number = 0.1,
  maxZoom: number = 5
): Transform {
  const newZoom = Math.max(
    minZoom,
    Math.min(maxZoom, currentTransform.zoom * zoomFactor)
  );

  const canvasPoint = screenToCanvas(
    centerScreenX,
    centerScreenY,
    currentTransform
  );

  const newX =
    centerScreenX - canvasPoint.x * newZoom;
  const newY =
    centerScreenY - canvasPoint.y * newZoom;

  return {
    x: newX,
    y: newY,
    zoom: newZoom,
  };
}

/**
 * Pan the canvas
 */
export function pan(
  transform: Transform,
  deltaX: number,
  deltaY: number
): Transform {
  return {
    ...transform,
    x: transform.x + deltaX,
    y: transform.y + deltaY,
  };
}

/**
 * Reset viewport to fit canvas
 */
export function resetViewport(
  canvasWidth: number,
  canvasHeight: number,
  viewportWidth: number,
  viewportHeight: number
): Transform {
  const zoom = Math.min(
    viewportWidth / canvasWidth,
    viewportHeight / canvasHeight
  ) * 0.9;

  return {
    x: (viewportWidth - canvasWidth * zoom) / 2,
    y: (viewportHeight - canvasHeight * zoom) / 2,
    zoom,
  };
}
