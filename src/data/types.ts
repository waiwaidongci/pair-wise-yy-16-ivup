export interface Category {
  id: string;
  label: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  summary: string;
  photoIds: string[];
}

export interface Photo {
  id: string;
  category: string;
  seriesId: string;
  /** Path relative to mock-data/, e.g. "photos/portrait/portrait-01.jpg" */
  file: string;
  title: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  order: number;
}

export interface GalleryData {
  categories: Category[];
  series: Series[];
  photos: Photo[];
}
