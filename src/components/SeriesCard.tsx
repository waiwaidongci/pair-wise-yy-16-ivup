import { Link } from 'react-router-dom'
import type { Photo, Series } from '../data/photos'
import { categoryLabel, photoUrl } from '../data/photos'
import { useLightbox } from '../context/LightboxContext'

interface SeriesCardProps {
  series: Series
  /** Cover + lightbox navigation scope: the full series, in order. */
  photos: Photo[]
}

export default function SeriesCard({ series, photos }: SeriesCardProps) {
  const { open } = useLightbox()
  const cover = photos[0]

  return (
    <article className="series-card">
      <button
        type="button"
        className="series-card__media"
        aria-label={`打开《${series.title}》系列照片`}
        onClick={() => open(photos, 0)}
      >
        <span className="ratio-box" style={{ aspectRatio: `${cover.width} / ${cover.height}` }}>
          <img src={photoUrl(cover)} alt={cover.altText} loading="lazy" decoding="async" />
        </span>
        <span className="series-card__hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 5.5c-3.7 0-6.6 2.4-7.9 6.5 1.3 4.1 4.2 6.5 7.9 6.5s6.6-2.4 7.9-6.5C18.6 7.9 15.7 5.5 12 5.5zm0 10.7a4.2 4.2 0 110-8.4 4.2 4.2 0 010 8.4zm0-2.4a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z"
              fill="currentColor"
            />
          </svg>
          查看
        </span>
      </button>
      <div className="series-card__body">
        <p className="eyebrow">{categoryLabel(series.category)}</p>
        <h3>
          <Link to={`/work/${series.id}`}>{series.title}</Link>
        </h3>
        <p className="series-card__summary">{series.summary}</p>
        <Link className="text-link" to={`/work/${series.id}`}>
          进入系列 →
        </Link>
      </div>
    </article>
  )
}
