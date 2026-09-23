import { useCallback, useEffect, useRef } from "react";
import AspectImage from "./AspectImage";
import { useLightbox } from "./LightboxContext";
import useWindowSize from "./useWindowSize";
import { getCategoryUiLabel } from "../data/gallery";

const MOBILE_BP = 760;

/**
 * Global, non-route lightbox. Rendered once at the app root.
 * Prev/next cycle ONLY through the `photos` array the opener provided
 * (all results, one filtered category, or one series).
 */
export default function Lightbox() {
  const { state, close, navigate } = useLightbox();
  const { width: vw, height: vh } = useWindowSize();
  const closeRef = useRef<HTMLButtonElement>(null);

  const isMobile = vw <= MOBILE_BP;

  const goPrev = useCallback(() => navigate(-1), [navigate]);
  const goNext = useCallback(() => navigate(1), [navigate]);

  // Keyboard: arrows move inside the scoped set, Esc closes.
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close, goPrev, goNext]);

  // Lock page scroll + move focus into the dialog while open.
  useEffect(() => {
    if (!state) return;
    document.body.classList.add("no-scroll");
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [state]);

  // Warm the cache for the neighbouring images.
  useEffect(() => {
    if (!state) return;
    const count = state.photos.length;
    [state.index - 1, state.index + 1].forEach((i) => {
      const wrapped = (i + count) % count;
      const img = new Image();
      img.src = state.photos[wrapped].src;
    });
  }, [state]);

  if (!state) return null;

  const { photos, index } = state;
  const photo = photos[index];

  // Fit the figure precisely to the photo ratio (desktop: side info panel).
  let frameStyle: React.CSSProperties;
  if (isMobile) {
    frameStyle = { width: "100%", height: "100%", aspectRatio: "auto" };
  } else {
    const maxW = vw - 96 * 2 - 44 - 280; // paddings + gap + info panel
    const maxH = vh - 64 * 2;
    const ratio = photo.width / photo.height;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    frameStyle = { width: `${Math.round(w)}px`, height: `${Math.round(h)}px` };
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${photo.title}`}
      onClick={close}
    >
      <button
        type="button"
        className="lb-close"
        ref={closeRef}
        onClick={close}
        aria-label="Close photo viewer"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 5l14 14M19 5L5 19"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="lb-arrow prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <figure className="lightbox-figure">
          <AspectImage
            key={photo.id}
            src={photo.src}
            alt={photo.altText}
            width={photo.width}
            height={photo.height}
            frameStyle={frameStyle}
            loading="eager"
            fetchPriority="high"
          />
        </figure>

        <aside className="lightbox-info">
          <p className="cat">{getCategoryUiLabel(photo.category)}</p>
          <h3>{photo.title}</h3>
          <p>{photo.caption}</p>
          <p className="counter">
            {index + 1} / {photos.length}
          </p>
        </aside>
      </div>

      {photos.length > 1 && (
        <button
          type="button"
          className="lb-arrow next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
