import { PropsWithChildren } from "react";
import "./Backdrop.scss";

interface BackdropProps extends PropsWithChildren {
  onClick: () => void;
  isVisible?: boolean;
}

export function Backdrop({
  onClick,
  children,
  isVisible = true,
}: BackdropProps) {
  return (
    <div
      className={`backdrop ${isVisible ? "backdrop-visible" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
