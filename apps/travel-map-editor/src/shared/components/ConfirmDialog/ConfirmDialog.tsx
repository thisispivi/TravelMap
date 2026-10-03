import "./ConfirmDialog.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { TriangleAlert } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * What a confirmation asks.
 * @property {string} title - The question, such as "Delete this trip?"
 * @property {string} message - What will happen, in plain words
 * @property {string} confirmLabel - The button that goes ahead
 * @property {boolean} [isDanger] - Whether going ahead destroys something
 * @property {() => void | Promise<void>} onConfirm - What going ahead does
 */
interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Properties accepted by the ConfirmDialog component.
 * @property {ConfirmRequest} request - What to ask
 * @property {() => void} onClose - Dismisses the dialog
 */
interface ConfirmDialogProps {
  request: ConfirmRequest;
  onClose: () => void;
}

/**
 * ConfirmDialog component
 * A modal question before anything that cannot be taken back with one click.
 * The safe answer has focus, so pressing Enter by reflex never deletes.
 * @component
 * @param {ConfirmDialogProps} props - The dialog props
 * @param {ConfirmRequest} props.request - What to ask
 * @param {() => void} props.onClose - Dismisses the dialog
 * @returns {ReactNode} The confirmation modal
 */
function ConfirmDialog({ request, onClose }: ConfirmDialogProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  /**
   * Goes ahead, keeping the dialog open until the action has finished so a
   * slow delete cannot be clicked twice.
   * @returns {Promise<void>} Completion after the action
   */
  async function handleConfirm(): Promise<void> {
    setIsWorking(true);
    try {
      await request.onConfirm();
    } finally {
      onClose();
    }
  }

  return (
    <dialog
      aria-describedby="confirm-dialog-message"
      aria-labelledby="confirm-dialog-title"
      className="confirm-dialog"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="confirm-dialog__header">
        {request.isDanger ? (
          <TriangleAlert aria-hidden="true" className="confirm-dialog__icon" />
        ) : null}
        <h2 className="confirm-dialog__title" id="confirm-dialog-title">
          {request.title}
        </h2>
      </div>
      <p className="confirm-dialog__message" id="confirm-dialog-message">
        {request.message}
      </p>
      <footer className="confirm-dialog__actions">
        <button
          autoFocus
          className="editor-button"
          disabled={isWorking}
          onClick={onClose}
          type="button"
        >
          {t("editorForm.cancel")}
        </button>
        <button
          className={classNames(
            "editor-button",
            request.isDanger
              ? "editor-button--danger"
              : "editor-button--primary",
          )}
          disabled={isWorking}
          onClick={handleConfirm}
          type="button"
        >
          {request.confirmLabel}
        </button>
      </footer>
    </dialog>
  );
}

/**
 * What useConfirm hands back.
 * @property {(request: ConfirmRequest) => void} confirm - Asks a question
 * @property {ReactNode} confirmDialog - The modal to render while one is open
 */
interface UseConfirmReturn {
  confirm: (request: ConfirmRequest) => void;
  confirmDialog: ReactNode;
}

/**
 * Lets a screen ask for confirmation with one call and render the answer's
 * modal in one place, so every confirmation in the editor looks and behaves
 * the same.
 * @returns {UseConfirmReturn} The ask function and the modal to render
 */
export function useConfirm(): UseConfirmReturn {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  return {
    confirm: setRequest,
    confirmDialog: request ? (
      <ConfirmDialog onClose={() => setRequest(null)} request={request} />
    ) : null,
  };
}
