import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryLabel, getSeries, photoUrl, photosForSeries, seriesList } from '../data/photos'
import { useLightbox } from '../context/LightboxContext'

export default function SeriesDetail() {
  const { seriesId = '' } = useParams()
  const series = getSeries(seriesId)
  const { open } = useLightbox()

  if (!series) return <Navigate to="/work" replace />

  const storyPhotos = photosForSeries(series.id)
  const cover = storyPhotos[0]
  const otherSeries = seriesList.filter((s) => s.id !== series.id)

  return (
    <article className="series-page">
      <header className="series-hero">
        <img className="series-hero__image" src={photoUrl(cover)} alt={cover.altText} />
        <div className="series-hero__veil" />
        <div className="series-hero__content container">
          <p className="eyebrow">{categoryLabel(series.category)}</p>
          <h1 className="series-hero__title">《{series.title}》</h1>
        </div>
      </header>

      <div className="container story">
        <p className="story-lede">
          <Link to="/work" className="back-link">
            ← 返回作品
          </Link>
        </p>

        <blockquote className="pull-quote">{series.summary}</blockquote>

        {storyPhotos.map((photo, index) => (
          <article
            key={photo.id}
            className={`story-block${index % 2 === 1 ? ' story-block--reverse' : ''}`}
          >
            <button
              type="button"
              className="photo-button story-photo"
              aria-label={`查看照片：${photo.title}`}
              onClick={() => open(storyPhotos, index)}
            >
              <span
                className="ratio-box"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <img src={photoUrl(photo)} alt={photo.altText} loading="lazy" decoding="async" />
              </span>
            </button>
            <div className="story-text">
              <p className="story-index">
                {String(index + 1).padStart(2, '0')} — {categoryLabel(photo.category)}
              </p>
              <h2>{photo.title}</h2>
              <p>{photo.caption}</p>
            </div>
          </article>
        ))}

        <footer className="story-foot">
          <span className="gold-rule" />
          <p className="story-other-label">继续阅读其他系列</p>
          <ul className="story-other-list">
            {otherSeries.map((s) => (
              <li key={s.id}>
                <Link to={`/work/${s.id}`} className="text-link">
                  《{s.title}》
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </article>
  )
}
