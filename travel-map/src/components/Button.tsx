import { ReactComponent as CloseIcon } from "../icons/Close.svg";
import { ReactComponent as BackIcon } from "../icons/Back.svg";

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

export function BackButtonWText({ text, onClick }: ButtonProps) {
  return (
    <button className="base-btn back-btn-text" onClick={onClick}>
      <BackIcon className="back-btn" />
      <p>{text}</p>
    </button>
  );
}

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return <CloseIcon className="close-btn" onClick={onClick} />;
}

export function BackButton({ onClick }: CloseButtonProps) {
  return <BackIcon className="back-btn" onClick={onClick} />;
}
