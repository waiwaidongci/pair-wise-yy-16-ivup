import { Link } from 'react-router-dom'
import { photosForSeriesResolved, photoUrl, seriesList } from '../data/photos'
import SeriesCard from '../components/SeriesCard'

export default function Home() {
  // Hero uses a real frame from the catalogue (雾谷), served from the shared data.
  const heroPhoto = photosForSeriesResolved(seriesList[1])[4]

  return (
    <>
      <section className="hero">
        <img
          className="hero__image"
          src={photoUrl(heroPhoto)}
          alt={heroPhoto.altText}
        />
        <div className="hero__veil" />
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">独立摄影师 · 高原记录者</p>
          <h1 className="hero__title">Remanina Holmson</h1>
          <p className="hero__intro">
            用最少的语言描述光。我在高海拔的山脊与牧场之间工作，
            记录雾如何收走山谷的边界，也记录人在镜头前的坦露与防备。
          </p>
          <Link to="/work" className="btn btn--solid">
            浏览作品
          </Link>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2 className="section-title">精选系列</h2>
          <span className="gold-rule" />
        </div>
        <div className="series-grid">
          {seriesList.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              photos={photosForSeriesResolved(series)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
