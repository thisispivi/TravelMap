import { PropsWithChildren } from "react";
import "./Backdrop.scss";

interface BackdropProps extends PropsWithChildren {
  onClick: () => void;
  visible?: boolean;
}

export function Backdrop({ onClick, children, visible = true }: BackdropProps) {
  return (
    <div
      className={`backdrop ${visible ? "backdrop-visible" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
