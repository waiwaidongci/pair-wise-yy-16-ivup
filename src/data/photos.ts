// Single source of truth: the structured metadata shipped in mock-data/.
// No photo/title/caption is ever duplicated in components — everything on
// /work, /work/:seriesId, home and the lightbox is derived from this import.
import rawData from '../../mock-data/photos.json'

export type CategoryId = 'portrait' | 'landscape' | 'pastoral'

export interface Category {
  id: CategoryId
  label: string
}

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

export interface Photo {
  id: string
  category: CategoryId
  seriesId: string
  file: string
  title: string
  altText: string
  caption: string
  width: number
  height: number
  order: number
}

interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

export const photoData = rawData as PhotoData
export const categories = photoData.categories
export const seriesList = photoData.series
export const photos = photoData.photos

const photoById = new Map(photos.map((p) => [p.id, p]))

export function getPhoto(id: string): Photo {
  const photo = photoById.get(id)
  if (!photo) throw new Error(`unknown photo id: ${id}`)
  return photo
}

export function getSeries(seriesId: string): Series | undefined {
  return seriesList.find((s) => s.id === seriesId)
}

export function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId
}

/** Photos of a series, in the narrative order declared by the data. */
export function photosForSeries(seriesId: string): Photo[] {
  return photos
    .filter((p) => p.seriesId === seriesId)
    .sort((a, b) => a.order - b.order)
}

/** Series' photos resolved and ordered via the series.photoIds list itself. */
export function photosForSeriesResolved(series: Series): Photo[] {
  return series.photoIds.map(getPhoto)
}

/** Photos shown on /work for a given filter ('all' or a category id). */
export function photosForFilter(filter: string): Photo[] {
  if (filter === 'all') return photos
  return photos.filter((p) => p.category === filter)
}

/** Public URL of a photo file served from public/photos (synced from mock-data). */
export function photoUrl(photo: Photo): string {
  return `/${photo.file}`
}
