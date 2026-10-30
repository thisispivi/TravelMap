import "./CoverImage.scss";

import { ReactNode, useState } from "react";

import { classNames } from "../../lib/classNames";

/**
 * Properties accepted by the CoverImage component.
 * @property {string | null | undefined} src - The image, or nothing for the tinted placeholder alone
 * @property {string} [className] - Extra classes from the owning block, which sizes it
 * @property {boolean} [isEager] - Whether to load at once rather than when scrolled near
 */
interface CoverImageProps {
  src: string | null | undefined;
  className?: string;
  isEager?: boolean;
}

/**
 * CoverImage component
 * A decorative photo that fills its box: loaded lazily by the browser and
 * faded in once decoded, over a soft tint so the layout never jumps or flashes
 * an empty frame.
 * @component
 * @param {CoverImageProps} props - The image props
 * @param {string | null | undefined} props.src - The image
 * @param {string} [props.className] - Extra classes from the owning block
 * @param {boolean} [props.isEager=false] - Whether to load at once
 * @returns {ReactNode} The image in its frame
 */
export function CoverImage({
  src,
  className,
  isEager = false,
}: CoverImageProps): ReactNode {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  return (
    <span aria-hidden="true" className={classNames("cover-image", className)}>
      {src ? (
        <img
          alt=""
          className={classNames(
            "cover-image__img",
            loadedSrc === src && "cover-image__img--loaded",
          )}
          decoding="async"
          loading={isEager ? "eager" : "lazy"}
          onLoad={() => setLoadedSrc(src)}
          src={src}
        />
      ) : null}
    </span>
  );
}
