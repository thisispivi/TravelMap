import { useState } from "react";
import { Mode } from "../../typings/mode";

export default function useMode() {
  const [currMode, setCurrMode] = useState<Mode | undefined>();
  const onModeChange = (mode: Mode) => {
    if (currMode === mode) return setCurrMode(undefined);
    if (currMode === undefined) return setCurrMode(mode);
    setCurrMode(undefined);
    setTimeout(() => setCurrMode(mode), 300);
  };
  const onClose = () => setCurrMode(undefined);

  return { currMode, onModeChange, onClose };
}

export type ModeHandler = {
  currMode: Mode | undefined;
  onModeChange: (mode: Mode) => void;
  onClose: () => void;
};
