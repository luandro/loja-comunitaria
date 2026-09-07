import { useEffect, useState, type ImgHTMLAttributes } from "react";

const FALLBACK_SRC = "/placeholder.svg";

interface StoreImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  /** Set only for the single most important image of a page (LCP). */
  priority?: boolean;
}

/**
 * Resilient <img> for slow phones and weak connections:
 *  - lazy loading + async decoding for everything that is not the LCP image
 *  - graceful fallback when a remote image is missing or blocked
 *  - responsive `sizes` support so the browser can pick a smaller source
 */
export const StoreImage = ({
  src,
  alt,
  priority = false,
  className = "",
  sizes,
  ...rest
}: StoreImageProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = !src || failed ? FALLBACK_SRC : src;
  const isFallback = resolved === FALLBACK_SRC;

  return (
    <img
      {...rest}
      src={resolved}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...({ fetchpriority: priority ? "high" : "auto" } as Record<string, string>)}
      onError={() => setFailed(true)}
      className={`${className} ${isFallback ? "bg-sand-100 object-contain p-6 opacity-70" : ""}`}
    />
  );
};

export default StoreImage;
