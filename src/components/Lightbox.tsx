import { useCallback, useEffect } from 'react'
import { categoryLabel, photoUrl } from '../data/photos'
import { useLightbox } from '../context/LightboxContext'

export default function Lightbox() {
  const { state, close, show } = useLightbox()

  const goPrev = useCallback(() => {
    if (state) show(state.index - 1)
  }, [state, show])

  const goNext = useCallback(() => {
    if (state) show(state.index + 1)
  }, [state, show])

  useEffect(() => {
    if (!state) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [state, close, goPrev, goNext])

  if (!state) return null

  const { list, index } = state
  const photo = list[index]
  const total = list.length
  const isSingle = total === 1

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} 照片查看器`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <button type="button" className="lightbox-close" aria-label="关闭" onClick={close}>
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      {!isSingle && (
        <button type="button" className="lightbox-nav lightbox-prev" aria-label="上一张" onClick={goPrev}>
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      )}

      <div className="lightbox-stage">
        <figure className="lightbox-figure">
          <img
            key={photo.id}
            className="lightbox-image"
            src={photoUrl(photo)}
            alt={photo.altText}
            width={photo.width}
            height={photo.height}
          />
          <figcaption className="lightbox-info">
            <p className="eyebrow">
              {categoryLabel(photo.category)}
              <span aria-hidden="true"> · </span>
              {index + 1} / {total}
            </p>
            <h2>{photo.title}</h2>
            <p className="caption">{photo.caption}</p>
          </figcaption>
        </figure>
      </div>

      {!isSingle && (
        <button type="button" className="lightbox-nav lightbox-next" aria-label="下一张" onClick={goNext}>
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </div>
  )
}
