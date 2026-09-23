// ---------------------------------------------------------------------------
// Single source of truth for all gallery content.
//
// Both /work (the filterable grid) and /work/:seriesId (the long-form series
// pages) derive every photo, title and caption from the ONE authoritative
// document at mock-data/photos.json. No component is allowed to keep a second,
// hard-coded copy of a photo list.
//
// The JPEGs stay in mock-data/photos/ too; Vite's import.meta.glob pulls them
// straight from that directory (hashed + bundled), so there is no duplicate
// asset store either.
// ---------------------------------------------------------------------------

import rawData from "../../mock-data/photos.json";
import type { Category, Photo, Series } from "./types";

const data = rawData as unknown as {
  categories: Category[];
  series: Series[];
  photos: Photo[];
};

// eager: false -> hashed URL strings, no duplicated bytes in JS.
const imageModules = import.meta.glob<string>(
  "../../mock-data/photos/**/*.jpg",
  { eager: true, query: "?url", import: "default" }
);

const urlByFile = new Map<string, string>();
for (const [modulePath, url] of Object.entries(imageModules)) {
  // modulePath: ../../mock-data/photos/portrait/portrait-01.jpg
  const key = modulePath.split("mock-data/")[1];
  urlByFile.set(key, url);
}

export interface PhotoRecord extends Photo {
  /** Bundled, cacheable URL of the image (still physically in mock-data/). */
  src: string;
  aspectRatio: number;
}

function decorate(photo: Photo): PhotoRecord {
  const src = urlByFile.get(photo.file);
  if (!src) {
    throw new Error(`Missing bundled image for ${photo.file}`);
  }
  return {
    ...photo,
    src,
    aspectRatio: photo.width / photo.height,
  };
}

export const categories: Category[] = data.categories;

const photosById = new Map<string, PhotoRecord>(
  data.photos.map((p) => [p.id, decorate(p)])
);

export const allPhotos: PhotoRecord[] = data.photos.map((p) =>
  photosById.get(p.id)!
);

export interface SeriesRecord extends Series {
  photos: PhotoRecord[];
  cover: PhotoRecord;
  categoryLabel: string;
}

export const seriesList: SeriesRecord[] = data.series.map((s) => {
  // Preserve the exact order declared by the JSON's photoIds array.
  const photos = s.photoIds
    .map((id) => photosById.get(id))
    .filter((p): p is PhotoRecord => Boolean(p));
  return {
    ...s,
    photos,
    cover: photos[0],
    categoryLabel:
      categories.find((c) => c.id === s.category)?.label ?? s.category,
  };
});

const seriesById = new Map(seriesList.map((s) => [s.id, s]));

export function getSeries(seriesId: string): SeriesRecord | undefined {
  return seriesById.get(seriesId);
}

export function getCategoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

// UI chrome is English (see assets/FONTS.md: "本项目页面文案为英文"); the
// creative content — series titles, photo titles and captions — stays in its
// original Chinese and is rendered straight from the data, untouched.
const uiLabels: Record<string, string> = {
  portrait: "Portrait",
  landscape: "Landscape",
  pastoral: "Pastoral",
};

export function getCategoryUiLabel(categoryId: string): string {
  return uiLabels[categoryId] ?? getCategoryLabel(categoryId);
}

/**
 * Grid contents for /work. "all" returns every photo ordered by category
 * order (as listed in the JSON) and then by each photo's `order`.
 */
export function photosForFilter(categoryId: "all" | string): PhotoRecord[] {
  if (categoryId === "all") {
    const rank = new Map(categories.map((c, i) => [c.id, i]));
    return [...allPhotos].sort((a, b) => {
      const byCategory = (rank.get(a.category) ?? 0) - (rank.get(b.category) ?? 0);
      return byCategory !== 0
        ? byCategory
        : a.order - b.order || a.id.localeCompare(b.id);
    });
  }
  return allPhotos
    .filter((p) => p.category === categoryId)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
