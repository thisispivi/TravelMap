import { ModeHandler } from "../../../hooks/mode/mode";
import "./InfoTabVisited.scss";

interface InfoTabVisitedProps {
  className?: string;
  modeHandler: ModeHandler;
}

export default function InfoTabVisited({
  className = "",
}: InfoTabVisitedProps) {
  return (
    <div className={`info-tab-visited ${className}`}>
      <div className="info-tab-visited__header">
        <h1>Visited Travels</h1>
      </div>
      <div className="info-tab-visited__content">
        <p>
          I am planning to visit these countries in the visited. If you have any
          recommendations, feel free to reach out to me.
        </p>
      </div>
    </div>
  );
}
