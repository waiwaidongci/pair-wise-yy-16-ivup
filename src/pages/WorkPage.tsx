import { Link } from "react-router-dom";
import {
  categories,
  photosForFilter,
  getCategoryUiLabel,
  seriesList,
} from "../data/gallery";
import PhotoCard from "../components/PhotoCard";

interface WorkPageProps {
  /** Lifted out of this page so it survives trips to /work/:seriesId. */
  filter: string;
  onFilterChange: (id: string) => void;
}

export default function WorkPage({ filter, onFilterChange }: WorkPageProps) {
  // This list is both the grid and the exact lightbox scope.
  const visible = photosForFilter(filter);
  const activeLabel =
    filter === "all"
      ? "All Works"
      : getCategoryUiLabel(filter);

  const activeSeries =
    filter !== "all"
      ? seriesList.find((s) => s.category === filter)
      : undefined;

  return (
    <>
      <div className="container">
        <header className="work-head">
          <p className="eyebrow">Selected photographs · 2019 – present</p>
          <h1>Work</h1>
          <p>
            Three ongoing series — close black-and-white portraits, empty
            high-altitude ground, and the pastoral life moving across it.
            Choose a subject to narrow the frame.
          </p>
        </header>

        <div className="filters" role="group" aria-label="Filter photographs by category">
          <button
            type="button"
            className={`filter-pill${filter === "all" ? " is-active" : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => onFilterChange("all")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-pill${filter === c.id ? " is-active" : ""}`}
              aria-pressed={filter === c.id}
              onClick={() => onFilterChange(c.id)}
            >
              {getCategoryUiLabel(c.id)}
            </button>
          ))}
        </div>

        <div className="gallery-meta">
          <span className="count">{activeLabel}</span>
          <span className="count">
            {visible.length} photograph{visible.length === 1 ? "" : "s"}
          </span>
        </div>

        <div
          className={`gallery-grid${filter === "all" ? " is-masonry" : " is-rows"}`}
        >
          {visible.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              scope={visible}
              index={index}
              categoryLabel={getCategoryUiLabel(photo.category)}
              eager={index < 2}
            />
          ))}
        </div>

        {activeSeries && (
          <p style={{ margin: "8px 0 72px", color: "var(--muted)", fontSize: "0.92rem" }}>
            These photographs belong to the series{" "}
            <Link
              to={`/work/${activeSeries.id}`}
              className="text-link"
              style={{ fontSize: "0.82rem" }}
            >
              {activeSeries.title}
            </Link>
            .
          </p>
        )}
      </div>
    </>
  );
}
