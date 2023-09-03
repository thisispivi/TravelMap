import { ReactComponent as CloseIcon } from "../../../icons/Close.svg";
import { ReactComponent as BackIcon } from "../../../icons/Back.svg";
import { PropsWithChildren } from "react";
import { Row } from "../../molecules";
import "./Button.scss";

interface ButtonProps extends PropsWithChildren {
  onClick: () => void;
  className?: string;
}

export function Button({ children, className = "", onClick }: ButtonProps) {
  return (
    <button className={`base-btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

interface TextButtonProps extends ButtonProps {
  text: string;
}

export function TextButton({
  text = "",
  className = "",
  onClick,
}: TextButtonProps) {
  return (
    <Button className={`text-btn ${className}`} onClick={onClick}>
      <p>{text}</p>
    </Button>
  );
}

export function TextBackButton({
  text = "",
  className = "",
  onClick,
}: TextButtonProps) {
  return (
    <Button className={`back-btn-text ${className}`} onClick={onClick}>
      <Row>
        <BackIcon className="back-btn" />
        <p>{text}</p>
      </Row>
    </Button>
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
