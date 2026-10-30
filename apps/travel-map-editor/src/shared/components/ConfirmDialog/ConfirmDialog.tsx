import "./ConfirmDialog.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { Dialog } from "@travelmap/ui/components/Dialog/Dialog";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { TriangleAlert } from "lucide-react";
import { ReactNode, useState } from "react";

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
  const [isWorking, setIsWorking] = useState(false);

  /**
   * Goes ahead, keeping the dialog open until the action has finished so a
   * slow delete cannot be clicked twice.
   * @returns {Promise<void>} Completion after the action
   */
  async function handleConfirm(): Promise<void> {
    setIsWorking(true);
    /* React Compiler cannot compile a `finally` block; the promise's own runs the same way. */
    await Promise.resolve().then(request.onConfirm).finally(onClose);
  }

  return (
    <Dialog
      actions={
        <>
          <Button autoFocus disabled={isWorking} onClick={onClose}>
            {t("editorForm.cancel")}
          </Button>
          <Button
            disabled={isWorking}
            onClick={handleConfirm}
            variant={request.isDanger ? "danger" : "primary"}
          >
            {request.confirmLabel}
          </Button>
        </>
      }
      icon={
        request.isDanger ? (
          <TriangleAlert aria-hidden="true" className="confirm-dialog__icon" />
        ) : undefined
      }
      onClose={onClose}
      size="small"
      title={request.title}
    >
      <p className="confirm-dialog__message">{request.message}</p>
    </Dialog>
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
