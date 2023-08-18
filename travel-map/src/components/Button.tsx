import { ReactComponent as CloseIcon } from "../icons/Close.svg";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export function Button({ text, onClick }: ButtonProps) {
  return (
    <button className="base-btn" onClick={onClick}>
      {text}
    </button>
  );
}

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return <CloseIcon className="close-btn" onClick={onClick} />;
}
