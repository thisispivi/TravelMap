import { PropsWithChildren, memo } from "react";
import "./InfoTab.scss";
import useLocation from "../../../hooks/location/location";

interface InfoTabProps extends PropsWithChildren {
  className?: string;
}

/**
 * InfoTab component
 *
 * The info tab component is used to display some informations on the
 * right of the left bar. It can display the future travels or the
 * visited cities and countries.
 *
 * @component
 *
 * @param {InfoTabProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab
 * @returns {JSX.Element} - The info tab
 */
export default memo(function InfoTab({
  className = "",
  children,
}: InfoTabProps): JSX.Element {
  const { isInfoTabOpen } = useLocation();
  return (
    <div
      className={`info-tab ${className} ${isInfoTabOpen ? "info-tab--open" : ""}`}
    >
      {children}
    </div>
  );
});
