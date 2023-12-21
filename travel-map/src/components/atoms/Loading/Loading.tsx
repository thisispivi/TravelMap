import "./Loading.scss";

interface SpinnerProps {
  className?: string;
  color?: string;
  centered?: boolean;
}

export function Spinner({
  className = "",
  color = "white",
  centered = true,
}: SpinnerProps) {
  return (
    <div
      className={`spinner-border ${centered ? "m-auto" : ""} ${className}`}
      style={{
        color: color,
      }}
      role="status"
    >
      <span className="sr-only" />
    </div>
  );
}

export function Loading({
  className = "",
  color = "white",
  centered = true,
}: SpinnerProps) {
  return (
    <Spinner
      className={`default-spinner ${centered ? "m-auto" : ""} ${className}`}
      color={color}
    />
  );
}

export function LoadingSmall({
  className = "",
  color = "white",
  centered = true,
}: SpinnerProps) {
  return (
    <Spinner
      className={`small-spinner ${centered ? "m-auto" : ""} ${className}`}
      color={color}
    />
  );
}

export function LoadingLarge({
  className = "",
  color = "white",
  centered = true,
}: SpinnerProps) {
  return (
    <Spinner
      className={`large-spinner ${centered ? "m-auto" : ""} ${className}`}
      color={color}
    />
  );
}

export function LoadingExtraLarge({
  className = "",
  color = "white",
  centered = true,
}: SpinnerProps) {
  return (
    <Spinner
      className={`xl-spinner ${centered ? "m-auto" : ""} ${className}`}
      color={color}
    />
  );
}
