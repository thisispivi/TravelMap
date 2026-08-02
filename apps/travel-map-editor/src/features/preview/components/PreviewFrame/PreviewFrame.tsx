import "./PreviewFrame.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { ReactNode, useState } from "react";

/**
 * A width the public site is checked at.
 * @property {string} id - Stable identifier used as the radio value
 * @property {number} width - Frame width in pixels
 */
interface PreviewWidth {
  id: "desktop" | "tablet" | "mobile";
  width: number;
}

/*
 * The public app's own dev server. Nothing is proxied or re-rendered here: it
 * reads the same files from disk, so an autosaved change reaches it through
 * Vite's own reload with no message passing between the two apps.
 */
const PREVIEW_ORIGIN = "http://localhost:5173";
const WIDTHS: PreviewWidth[] = [
  { id: "desktop", width: 1440 },
  { id: "tablet", width: 1024 },
  { id: "mobile", width: 390 },
];

/**
 * PreviewFrame component
 * Shows the public site rendering the authored data, at the three widths the
 * responsive strategy is written against.
 * @component
 * @param {PreviewFrameProps} props
 * @param {string} props.tripId - The trip to open in the preview
 * @returns {ReactNode} The preview pane
 */
export function PreviewFrame({ tripId }: PreviewFrameProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [width, setWidth] = useState<PreviewWidth>(WIDTHS[0]!);
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <div className="preview-frame">
      <div className="preview-frame__widths" role="radiogroup">
        {WIDTHS.map((option) => (
          <button
            aria-checked={option.id === width.id}
            className={classNames(
              "editor-button",
              option.id === width.id && "editor-button--primary",
            )}
            key={option.id}
            onClick={() => setWidth(option)}
            role="radio"
            type="button"
          >
            {t(`preview.${option.id}`)}
          </button>
        ))}
        <a
          className="editor-button"
          href={`${PREVIEW_ORIGIN}/#/trip/${tripId}`}
          rel="noreferrer"
          target="_blank"
        >
          {t("preview.openInTab")}
        </a>
      </div>
      {hasFailed ? (
        <p className="editor-notice editor-notice--warning">
          <span className="editor-notice__item">{t("preview.notRunning")}</span>
        </p>
      ) : null}
      <div className="preview-frame__viewport">
        <iframe
          className="preview-frame__iframe"
          onError={() => setHasFailed(true)}
          src={`${PREVIEW_ORIGIN}/#/trip/${tripId}`}
          style={{ width: `${width.width}px` }}
          title={t("preview.title")}
        />
      </div>
    </div>
  );
}

/**
 * Props for PreviewFrame.
 * @property {string} tripId - The trip to open in the preview
 */
interface PreviewFrameProps {
  tripId: string;
}
