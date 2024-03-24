import { PropsWithChildren, memo } from "react";
import "./InfoTab.scss";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isOpen =
    location.pathname === "/visited" || location.pathname === "/future";
  return (
    <div className={`info-tab ${className} ${isOpen ? "info-tab--open" : ""}`}>
      {children}
    </div>
  );
});
