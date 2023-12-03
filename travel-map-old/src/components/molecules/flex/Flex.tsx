import { PropsWithChildren } from "react";
import "./Flex.scss";

interface FlexProps extends PropsWithChildren {
  className?: string;
}

export function Row({ children, className = "" }: FlexProps) {
  return <div className={`row ${className}`}>{children}</div>;
}

export function Column({ children, className = "" }: FlexProps) {
  return <div className={`column ${className}`}>{children}</div>;
}
