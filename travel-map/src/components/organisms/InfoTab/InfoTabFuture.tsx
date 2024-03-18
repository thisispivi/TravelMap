import { ModeHandler } from "../../../hooks/mode/mode";
import "./InfoTabFuture.scss";

interface InfoTabFutureProps {
  className?: string;
  modeHandler: ModeHandler;
}

/**
 * InfoTabFuture component
 *
 * The info tab future component is used to display the future travels.
 *
 * @component
 *
 * @param {InfoTabFutureProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab future
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @returns {JSX.Element} - The info tab future
 */
export default function InfoTabFuture({
  className = "",
}: InfoTabFutureProps): JSX.Element {
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
