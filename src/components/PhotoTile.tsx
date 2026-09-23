import type { Photo } from '../data/photos'
import { categoryLabel, photoUrl } from '../data/photos'
import { useLightbox } from '../context/LightboxContext'

interface PhotoTileProps {
  /** Navigation scope for the lightbox opened from this tile. */
  list: Photo[]
  index: number
  /** Show title/category as an overlay (desktop grid) instead of caption rows. */
  overlay?: boolean
}

export default function PhotoTile({ list, index, overlay = false }: PhotoTileProps) {
  const { open } = useLightbox()
  const photo = list[index]

  return (
    <button
      type="button"
      className={`photo-button photo-tile${overlay ? ' photo-tile--overlay' : ''}`}
      onClick={() => open(list, index)}
      aria-label={`查看照片：${photo.title}`}
    >
      {/* ratio-box reserves the exact intrinsic aspect ratio before the JPEG arrives (CLS) */}
      <span className="ratio-box" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <img src={photoUrl(photo)} alt={photo.altText} loading="lazy" decoding="async" />
      </span>
      <span className="photo-meta">
        <strong>{photo.title}</strong>
        <span className="photo-category">{categoryLabel(photo.category)}</span>
      </span>
    </button>
  )
}
