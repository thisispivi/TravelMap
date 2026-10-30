import "./Dialog.scss";

import { ReactNode, useEffect, useId, useRef } from "react";

import { classNames } from "../../lib/classNames";

/** How wide a dialog opens: a question, a short form, or a table. */
type DialogSize = "small" | "medium" | "large";

/**
 * Properties accepted by the Dialog component.
 * @property {ReactNode} title - The heading, which also names the dialog
 * @property {() => void} onClose - Closes it, from Escape or the owner's own buttons
 * @property {ReactNode} children - The content
 * @property {ReactNode} [actions] - The buttons along its foot
 * @property {ReactNode} [icon] - A mark beside the title, such as a warning
 * @property {DialogSize} [size] - How wide it opens
 * @property {boolean} [canClose] - Whether Escape closes it; false while it is busy
 * @property {string} [className] - The owner's block for its content
 */
interface DialogProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  size?: DialogSize;
  canClose?: boolean;
  className?: string;
}

/**
 * Dialog component
 * A modal over the whole window, in the panel's frosted glass: a native
 * `<dialog>` opened with `showModal`, so the browser traps focus, makes the
 * page behind inert, and closes it on Escape. It opens when mounted; the
 * owner closes it by unmounting it.
 * @component
 * @param {DialogProps} props - The dialog props
 * @param {ReactNode} props.title - The heading, which also names the dialog
 * @param {() => void} props.onClose - Closes it
 * @param {ReactNode} props.children - The content
 * @param {ReactNode} [props.actions] - The buttons along its foot
 * @param {ReactNode} [props.icon] - A mark beside the title
 * @param {DialogSize} [props.size="medium"] - How wide it opens
 * @param {boolean} [props.canClose=true] - Whether Escape closes it
 * @param {string} [props.className] - The owner's block for its content
 * @returns {ReactNode} The dialog
 */
export function Dialog({
  title,
  onClose,
  children,
  actions,
  icon,
  size = "medium",
  canClose = true,
  className,
}: DialogProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      className={classNames("dialog", `dialog--${size}`, className)}
      onCancel={(event) => (canClose ? onClose() : event.preventDefault())}
      onClose={onClose}
      ref={dialogRef}
    >
      <header className="dialog__header">
        {icon}
        <h2 className="dialog__title" id={titleId}>
          {title}
        </h2>
      </header>
      {children}
      {actions ? <footer className="dialog__actions">{actions}</footer> : null}
    </dialog>
  );
}
