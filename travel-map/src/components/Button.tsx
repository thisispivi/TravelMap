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
