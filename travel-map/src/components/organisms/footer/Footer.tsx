import "./Footer.scss";
import { DarkModeToggle } from "../../atoms/toggle/Toogle";

interface FooterProps {
  className?: string;
  setDarkMode: (isDarkMode: boolean) => void;
  active?: boolean;
}

export function Footer({
  className = "",
  active = true,
  setDarkMode,
}: FooterProps) {
  return (
    <div className={`footer ${className} ${active ? "footer-active" : ""}`}>
      <DarkModeToggle setDarkMode={setDarkMode} />
    </div>
  );
}
