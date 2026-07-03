/**
 * Image storage using IndexedDB
 */
import Dexie, { Table } from 'dexie';

interface StoredImage {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
}

class ImageDB extends Dexie {
  images!: Table<StoredImage>;

  constructor() {
    super('PeekImageDB');
    this.version(1).stores({
      images: '&id',
    });
  }
}

const db = new ImageDB();

/**
 * Store an image blob in IndexedDB
 */
export async function storeImage(
  id: string,
  blob: Blob,
  width: number,
  height: number
): Promise<void> {
  await db.images.put({
    id,
    blob,
    width,
    height,
    createdAt: Date.now(),
  });
}

/**
 * Retrieve an image blob from IndexedDB
 */
export async function retrieveImage(id: string): Promise<StoredImage | undefined> {
  return await db.images.get(id);
}

/**
 * Get URL for a stored image
 */
export function getImageUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Delete an image from IndexedDB
 */
export async function deleteImage(id: string): Promise<void> {
  await db.images.delete(id);
}

/**
 * Clear all images
 */
export async function clearAllImages(): Promise<void> {
  await db.images.clear();
}

/**
 * Get all stored images metadata
 */
export async function getAllImages(): Promise<StoredImage[]> {
  return await db.images.toArray();
}

/**
 * Resize image blob
 */
export async function resizeImage(
  blob: Blob,
  maxWidth: number,
  maxHeight: number
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((resizedBlob) => {
        URL.revokeObjectURL(url);
        resolve({
          blob: resizedBlob!,
          width,
          height,
        });
      }, 'image/jpeg', 0.9);
    };

    img.src = url;
  });
}

/**
 * Get image dimensions from blob
 */
export function getImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.src = url;
  });
}
