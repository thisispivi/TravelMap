import "./EditorShell.scss";

import { useThemeDetector } from "@travelmap/ui/hooks/useThemeDetector";
import { ReactNode, useEffect, useRef, useState } from "react";

import { EditorMap } from "@/features/map/components/EditorMap/EditorMap";
import { CommandPalette } from "@/features/palette/components/CommandPalette/CommandPalette";
import { SaveChip } from "@/shared/components/SaveChip/SaveChip";
import { useSaveStatus } from "@/shared/context/SaveStatus.context";

import { EditorRoutes } from "../routing/EditorRoutes";
import { EditorNav } from "./EditorShell.nav";

/**
 * EditorShell component
 * The editor's shell, built like the site's: one map fills the window, the
 * rail runs down its left edge, and every screen opens in a frosted panel
 * beside the map. The map stays mounted while the panel changes, and each
 * screen tells it what to draw.
 * @component
 * @returns {ReactNode} The local editor UI
 */
export function EditorShell(): ReactNode {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const { status } = useSaveStatus();
  const panelRef = useRef<HTMLElement>(null);
  const [insetLeft, setInsetLeft] = useState(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(() =>
      setInsetLeft(panel.getBoundingClientRect().right),
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="editor">
      <EditorMap insetLeft={insetLeft} isDarkTheme={isDarkTheme} />
      <EditorNav
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleDarkModeSwitch}
      />
      <main className="editor__panel" ref={panelRef}>
        <EditorRoutes />
      </main>
      {status ? (
        <div className="editor__status">
          <SaveChip
            error={status.error}
            onRetry={status.retry}
            savedAt={status.savedAt}
            state={status.state}
          />
        </div>
      ) : null}
      <CommandPalette />
    </div>
  );
}
