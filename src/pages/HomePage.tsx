import { Link } from "react-router-dom";
import { allPhotos, seriesList, getCategoryUiLabel } from "../data/gallery";
import AspectImage from "../components/AspectImage";

export default function HomePage() {
  // The hero is a real frame from the library (wildflower meadow),
  // never one of the design-reference images in /assets.
  const hero =
    allPhotos.find((p) => p.id === "landscape-01") ?? allPhotos[0];

  return (
    <>
      <section className="hero">
        <AspectImage
          src={hero.src}
          alt={hero.altText}
          width={hero.width}
          height={hero.height}
          loading="eager"
          fetchPriority="high"
        />
        <div className="container hero-inner-wrap">
          <div className="hero-inner">
            <p className="eyebrow">Photographer · Tibetan Plateau</p>
            <h1>Dechen Lhamo</h1>
            <p>
              A quiet record of two subjects: the faces that allow a camera to
              stay close, and the high-altitude landscapes where no one is
              watching. Portraits in black and white, and the light above the
              plateau in colour.
            </p>
            <Link to="/work" className="text-link">
              View the work
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Works</h2>
            <span className="rule" aria-hidden="true" />
          </div>

          <div className="series-cards">
            {seriesList.map((series) => (
              <Link
                key={series.id}
                to={`/work/${series.id}`}
                className="series-card"
              >
                <AspectImage
                  src={series.cover.src}
                  alt={series.cover.altText}
                  width={series.cover.width}
                  height={series.cover.height}
                  loading="lazy"
                />
                <span className="series-card-overlay">
                  <span className="cat">{getCategoryUiLabel(series.category)}</span>
                  <h3>{series.title}</h3>
                  <p>{series.summary}</p>
                  <span className="go">Explore the series →</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
