import { LogoIcon } from "../../../assets";
import "./LeftBar.scss";

interface LeftBarProps {
  className?: string;
}

export default function LeftBar({ className = "" }: LeftBarProps) {
  return (
    <div className={`left-bar ${className}`}>
      <div className="left-bar__container">
        <LogoIcon />
      </div>
    </div>
  );
}
