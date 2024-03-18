import { ModeHandler } from "../../../hooks/mode/mode";
import "./InfoTabFuture.scss";

interface InfoTabFutureProps {
  className?: string;
  modeHandler: ModeHandler;
}

export default function InfoTabFuture({ className = "" }: InfoTabFutureProps) {
  return (
    <div className={`info-tab-future ${className}`}>
      <div className="info-tab-future__header">
        <h1>Future Travels</h1>
      </div>
      <div className="info-tab-future__content">
        <p>
          I am planning to visit these countries in the future. If you have any
          recommendations, feel free to reach out to me.
        </p>
      </div>
    </div>
  );
}
