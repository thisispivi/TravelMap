import "./Logo.scss";

interface LogoProps {
  isDarkMode?: boolean;
}

export function Logo({ isDarkMode = false }: LogoProps) {
  return (
    <img
      className="logo"
      src={`/TravelMap/logo-${isDarkMode ? "dark" : "light"}.png`}
      alt="logo"
    />
  );
}
