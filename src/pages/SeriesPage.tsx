import { Link, Navigate, useParams } from "react-router-dom";
import {
  getSeries,
  getCategoryUiLabel,
  seriesList,
  type PhotoRecord,
} from "../data/gallery";
import PhotoCard from "../components/PhotoCard";
import AspectImage from "../components/AspectImage";

/**
 * Long-form series page. Every photograph, title and caption shown here is
 * read from the SAME gallery model as /work (via getSeries() — which orders
 * by the JSON's photoIds). Nothing is duplicated or re-hard-coded here.
 */
export default function SeriesPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const series = seriesId ? getSeries(seriesId) : undefined;

  if (!series) {
    return <Navigate to="/work" replace />;
  }

  // Lightbox scope = this series only, in declared order.
  const scope: PhotoRecord[] = series.photos;
  const cover = series.cover;
  // The cover leads the hero; the remaining photos carry the narrative.
  const body = series.photos.slice(1);

  const position = seriesList.findIndex((s) => s.id === series.id);
  const prevSeries = seriesList[(position - 1 + seriesList.length) % seriesList.length];
  const nextSeries = seriesList[(position + 1) % seriesList.length];

  return (
    <>
      <section className="series-hero">
        <AspectImage
          src={cover.src}
          alt={cover.altText}
          width={cover.width}
          height={cover.height}
          loading="eager"
          fetchPriority="high"
        />
        <div className="container series-hero-inner">
          <p className="eyebrow">{getCategoryUiLabel(series.category)} series</p>
          <h1>{series.title}</h1>
          <p>{series.summary}</p>
        </div>
      </section>

      <div className="container">
        <p className="back-row">
          <Link to="/work" className="text-link">
            ← Back to Work
          </Link>
        </p>

        <div className="series-intro">
          <p style={{ margin: 0, color: "var(--muted)", maxWidth: "56ch" }}>
            The series is presented in the order the frames were made.
            Captions were written at the scene and are shown unedited.
          </p>
          <div className="meta">
            Category
            <strong>{getCategoryUiLabel(series.category)}</strong>
          </div>
          <div className="meta">
            Photographs
            <strong>
              {series.photos.length.toString().padStart(2, "0")}
            </strong>
          </div>
        </div>

        <div className="narrative">
          {body.map((photo, i) => {
            const globalIndex = i + 1;
            const flipped = i % 2 === 1;

            return (
              <div key={photo.id}>
                <div
                  className={`narrative-block${flipped ? " is-flipped" : ""}`}
                >
                  <div className="narrative-media">
                    <span className="narrative-index">
                      {String(globalIndex + 1).padStart(2, "0")} — {photo.title}
                    </span>
                    <PhotoCard
                      photo={photo}
                      scope={scope}
                      index={globalIndex}
                      categoryLabel={getCategoryUiLabel(photo.category)}
                      bare
                    />
                  </div>
                  <div className="narrative-text">
                    <p className="eyebrow">Plate {globalIndex + 1}</p>
                    <h2>{photo.title}</h2>
                    <p>{photo.caption}</p>
                  </div>
                </div>

                {/* Interlude after every second frame: the cover returns as
                    a recurring motif, paired with the series summary from the
                    same data model; it opens the lightbox at its own index. */}
                {i % 2 === 1 && i < body.length - 1 && (
                  <div className="narrative-quote">
                    <div className="narrative-media">
                      <PhotoCard
                        photo={cover}
                        scope={scope}
                        index={0}
                        categoryLabel={getCategoryUiLabel(cover.category)}
                        bare
                      />
                    </div>
                    <blockquote className="pull-quote">
                      “{series.summary}”
                      <cite>— {series.title}</cite>
                    </blockquote>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <nav className="series-footer-nav" aria-label="Series navigation">
          <Link to={`/work/${prevSeries.id}`} className="prev">
            ← Previous series
            <strong>{prevSeries.title}</strong>
          </Link>
          <Link to={`/work/${nextSeries.id}`} className="next">
            Next series →
            <strong>{nextSeries.title}</strong>
          </Link>
        </nav>
      </div>
    </>
  );
}
