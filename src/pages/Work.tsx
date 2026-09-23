import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { categories, getSeries, photosForFilter } from '../data/photos'
import { usePhotoFilter } from '../context/filterStore'
import PhotoTile from '../components/PhotoTile'

export default function Work() {
  const [filter, setFilter] = usePhotoFilter()

  const filteredPhotos = useMemo(() => photosForFilter(filter), [filter])
  const activeSeries = filter === 'all' ? undefined : getSeries(
    // one series per category in this catalogue
    filteredPhotos.length ? filteredPhotos[0].seriesId : '',
  )

  return (
    <section className="section container work-page">
      <header className="page-head">
        <h1 className="page-title">作品</h1>
        <p className="page-lede">
          三个系列，十四张照片。点开任意一张，可在当前这组影像之间来回翻阅。
        </p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选照片">
        <FilterButton label="全部" pressed={filter === 'all'} onClick={() => setFilter('all')} />
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            label={category.label}
            pressed={filter === category.id}
            onClick={() => setFilter(category.id)}
          />
        ))}
      </div>

      {activeSeries && (
        <p className="filter-note">
          正在浏览《
          <Link to={`/work/${activeSeries.id}`}>{activeSeries.title}</Link>
          》系列 · {filteredPhotos.length} 张
        </p>
      )}

      <div className="photo-masonry" role="list">
        {filteredPhotos.map((photo, index) => (
          <div role="listitem" key={photo.id}>
            <PhotoTile list={filteredPhotos} index={index} overlay />
          </div>
        ))}
      </div>
    </section>
  )
}

function FilterButton({
  label,
  pressed,
  onClick,
}: {
  label: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`filter-chip${pressed ? ' is-active' : ''}`}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
