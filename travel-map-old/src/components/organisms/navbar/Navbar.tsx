import "./Navbar.scss";
import { Logo } from "../../atoms";

interface NavbarProps {
  className?: string;
  isDarkMode: boolean;
  active?: boolean;
}

export function Navbar({
  className = "",
  active = true,
  isDarkMode,
}: NavbarProps) {
  return (
    <div className={`navbar ${className} ${active ? "navbar-active" : ""}`}>
      <Logo isDarkMode={isDarkMode} />
    </div>
  );
}
