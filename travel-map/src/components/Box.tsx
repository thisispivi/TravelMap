import { ReactNode, useRef, useEffect } from "react";
import { CloseButton } from "./Button";

interface BoxProps {
  title: ReactNode;
  content: ReactNode;
  onClose: () => void;
}

export function Box({ title, content, onClose }: BoxProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (boxRef.current && !boxRef.current.contains(event.target as any)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [boxRef, onClose]);

  return (
    <div className="box-container">
      <div className="box" ref={boxRef}>
        <div className="title">
          {title} <CloseButton onClick={onClose} />
        </div>
        <div className="content">{content}</div>
      </div>
    </div>
  );
}
