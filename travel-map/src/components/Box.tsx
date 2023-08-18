import { ReactNode } from "react";
import { CloseButton } from "./Button";

interface BoxProps {
  title: ReactNode;
  content: ReactNode;
  onClose: () => void;
}

export function Box({ title, content, onClose }: BoxProps) {
  return (
    <div className="box">
      <div className="title">
        {title} <CloseButton onClick={onClose} />
      </div>
      <div className="content">{content}</div>
    </div>
  );
}
