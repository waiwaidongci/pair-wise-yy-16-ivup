import { useState, type CSSProperties } from "react";

interface AspectImageProps {
  src: string;
  alt: string;
  /** Real pixel dimensions from photos.json, used to reserve the box. */
  width: number;
  height: number;
  className?: string;
  /** Extra style for the reserving frame (the lightbox needs width/height math). */
  frameStyle?: CSSProperties;
  imgClassName?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "auto";
}

/**
 * Image whose box is sized from the authoritative width/height metadata
 * BEFORE the bytes arrive, so loading can never shift the layout (CLS).
 */
export default function AspectImage({
  src,
  alt,
  width,
  height,
  className,
  frameStyle,
  imgClassName,
  sizes,
  loading = "lazy",
  fetchPriority = "auto",
}: AspectImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`img-frame${className ? ` ${className}` : ""}`}
      style={{ aspectRatio: `${width} / ${height}`, ...frameStyle }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        // @ts-expect-error fetchpriority is lowercase in the DOM API
        fetchpriority={fetchPriority === "high" ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={`${loaded ? "is-loaded" : ""}${
          imgClassName ? ` ${imgClassName}` : ""
        }`}
      />
    </div>
  );
}
