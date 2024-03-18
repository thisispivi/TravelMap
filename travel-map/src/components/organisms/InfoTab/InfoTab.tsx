import { InfoTabFuture, InfoTabVisited } from "..";
import { ModeHandler } from "../../../hooks/mode/mode";
import { Mode } from "../../../typings/mode";
import "./InfoTab.scss";

interface InfoTabProps {
  className?: string;
  modeHandler: ModeHandler;
}

export default function InfoTab({ className = "", modeHandler }: InfoTabProps) {
  return (
    <div
      className={`info-tab ${className} ${
        modeHandler.currMode ? "info-tab--open" : ""
      }`}
    >
      {modeHandler.currMode === Mode.FUTURE && (
        <InfoTabFuture modeHandler={modeHandler} />
      )}
      {modeHandler.currMode === Mode.VISITED && (
        <InfoTabVisited modeHandler={modeHandler} />
      )}
    </div>
  );
}
