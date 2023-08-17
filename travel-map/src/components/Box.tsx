import { ReactNode } from "react";

interface BoxProps {
  title: ReactNode;
  content: ReactNode;
  onClose?: () => void;
}

export function Box({ title, content, onClose }: BoxProps) {
  return (
    <div className="box">
      <div className="title">{title}</div>
      <div className="content">{content}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
