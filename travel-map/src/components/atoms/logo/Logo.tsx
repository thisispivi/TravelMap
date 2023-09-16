import "./Logo.scss";

interface LogoProps {
  urlPrefix?: string;
  isDarkMode?: boolean;
}

export function Logo({ urlPrefix = "", isDarkMode = false }: LogoProps) {
  return (
    <img
      className="logo"
      src={`/${urlPrefix}logo-${isDarkMode ? "dark" : "light"}.png`}
      alt="logo"
    />
  );
}
