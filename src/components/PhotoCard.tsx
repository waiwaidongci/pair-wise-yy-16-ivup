import AspectImage from "./AspectImage";
import { useLightbox } from "./LightboxContext";
import type { PhotoRecord } from "../data/gallery";

interface PhotoCardProps {
  photo: PhotoRecord;
  /** The set this card belongs to — the lightbox loops only within it. */
  scope: PhotoRecord[];
  /** Index of this photo inside `scope`. */
  index: number;
  categoryLabel: string;
  eager?: boolean;
  /** Suppress the built-in overlays/captions (series page supplies its own). */
  bare?: boolean;
}

/**
 * A grid/narrative photo. Clicking opens the global lightbox scoped to the
 * exact list supplied by the parent page (all-filter result, one category,
 * or one series).
 */
export default function PhotoCard({
  photo,
  scope,
  index,
  categoryLabel,
  eager = false,
  bare = false,
}: PhotoCardProps) {
  const { open } = useLightbox();

  return (
    <button
      type="button"
      className={`photo-card${bare ? " is-bare" : ""}`}
      onClick={() => open(scope, index)}
      aria-label={`View photo “${photo.title}” — ${categoryLabel}`}
    >
      <AspectImage
        src={photo.src}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />

      {!bare && (
        <>
          {/* desktop hover overlay */}
          <span className="hover-overlay" aria-hidden="true">
            <span className="view" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <span className="cat">{categoryLabel}</span>
            <h3>{photo.title}</h3>
          </span>

          {/* mobile: caption below the image */}
          <span className="mobile-caption">
            <span className="cat">{categoryLabel}</span>
            <h3>{photo.title}</h3>
          </span>
        </>
      )}
    </button>
  );
}
