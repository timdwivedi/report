/**
 * IndexedDB Image Store for X-Ray Feedback Attachments
 *
 * Stores screenshot images in IndexedDB (hundreds of MB capacity)
 * while feedback metadata stays in localStorage.
 *
 * Uses the `idb` library already installed in the project.
 */

import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'xray-feedback-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

export interface StoredImage {
  id: string
  feedbackItemId: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('feedbackItemId', 'feedbackItemId', { unique: false })
        }
      },
    })
  }
  return dbPromise
}

/** Save an image to IndexedDB */
export async function saveImage(image: StoredImage): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, image)
}

/** Save multiple images at once */
export async function saveImages(images: StoredImage[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  for (const image of images) {
    tx.store.put(image)
  }
  await tx.done
}

/** Get all images for a specific feedback item */
export async function getImagesByFeedbackId(feedbackItemId: string): Promise<StoredImage[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'feedbackItemId', feedbackItemId)
}

/** Get a single image by ID */
export async function getImage(id: string): Promise<StoredImage | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

/** Delete all images for a specific feedback item */
export async function deleteImagesByFeedbackId(feedbackItemId: string): Promise<void> {
  const db = await getDB()
  const images = await db.getAllFromIndex(STORE_NAME, 'feedbackItemId', feedbackItemId)
  const tx = db.transaction(STORE_NAME, 'readwrite')
  for (const img of images) {
    tx.store.delete(img.id)
  }
  await tx.done
}

/** Delete a single image */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/** Get all images in the store */
export async function getAllImages(): Promise<StoredImage[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/** Clear all images from the store */
export async function clearAllImages(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/** Convert a File to a data URL string */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Convert a data URL to a Blob (for zip export) */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
  const raw = atob(parts[1])
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i)
  }
  return new Blob([arr], { type: mime })
}
