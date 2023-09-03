import { PropsWithChildren } from "react";
import "./Backdrop.scss";

interface BackdropProps extends PropsWithChildren {
  onClick: () => void;
}

export function Backdrop({ onClick, children }: BackdropProps) {
  return (
    <div className="backdrop" onClick={onClick}>
      {children}
    </div>
  );
}
