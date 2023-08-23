import { ReactNode, useRef, useEffect, PropsWithChildren } from "react";
import { CloseButton } from "./Button";

interface BoxProps extends PropsWithChildren {
  title: ReactNode;
  onClose: () => void;
  className?: string;
}

export function Box({ title, children, onClose, className = "" }: BoxProps) {
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
    <div className={`box-container ${className}`}>
      <div className="box" ref={boxRef}>
        <div className="title">
          {title} <CloseButton onClick={onClose} />
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
