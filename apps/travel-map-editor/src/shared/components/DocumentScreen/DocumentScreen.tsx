import "./DocumentScreen.scss";

import { PanelFrame } from "@app/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import { useAutosave } from "../../hooks/useAutosave";
import { useConfirm } from "../ConfirmDialog/ConfirmDialog";
import { useToast } from "../Toast/Toast";

/**
 * DocumentScreen component
 * Frames one dataset document in the editor's panel, with the same autosave
 * the trip workspace uses.
 * Replaces the previous save-and-reload form: with the dataset held in memory
 * there is nothing left for an explicit save to do, and a document that writes
 * as you edit cannot lose work to a forgotten button.
 * Problems are shown, not enforced — an in-progress document is allowed to be
 * invalid on disk, because the alternative is discarding what was just typed.
 * @component
 * @param {DocumentScreenProps} props
 * @param {string} [props.backLabel] - The back link's text
 * @param {string} [props.backTo] - Where the back link goes, such as the list it came from
 * @param {ReactNode} props.children - Form fields
 * @param {string} [props.deletedMessage] - Toast shown after deletion
 * @param {boolean} props.isDirty - Whether the draft differs from the saved file
 * @param {string} props.kind - Document kind shown beside its path
 * @param {() => Promise<void>} [props.onDelete] - Removes the document when provided
 * @param {() => Promise<void>} props.onSave - Persists the current draft
 * @param {string} props.path - Dataset-relative JSON path
 * @param {string[]} [props.problems] - Things worth fixing before publishing
 * @param {string} [props.savedMessage] - Toast shown after autosave
 * @param {string} props.title - Screen title
 * @param {string} [props.titleIconUrl] - Flag or icon shown beside the title
 * @param {unknown} props.value - The draft, watched so a burst of typing writes once
 * @returns {ReactNode} The autosaving document frame
 */
export function DocumentScreen({
  backLabel,
  backTo,
  children,
  deletedMessage,
  isDirty,
  kind,
  onDelete,
  onSave,
  path,
  problems = [],
  savedMessage,
  title,
  titleIconUrl,
  value,
}: DocumentScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { showToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [message, setMessage] = useState("");
  useAutosave(value, onSave, isDirty, {
    onSaved: () => showToast(savedMessage ?? t("toast.documentSaved")),
  });

  /**
   * Deletes the document once the author has confirmed.
   * @returns {Promise<void>} Completion after the delete attempt
   */
  async function handleDelete(): Promise<void> {
    if (!onDelete) return;
    try {
      await onDelete();
      showToast(deletedMessage ?? t("toast.documentDeleted"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("editorForm.deleteError");
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  }
  return (
    <PanelFrame
      header={
        <header className="document-screen__header">
          {backTo ? (
            <Link className="document-screen__back" to={backTo}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>
          ) : null}
          <div className="document-screen__bar">
            <div className="document-screen__identity">
              <h1 className="document-screen__title">
                {titleIconUrl ? (
                  <img
                    alt=""
                    className="document-screen__title-icon"
                    src={titleIconUrl}
                  />
                ) : null}
                {title}
              </h1>
              <p className="document-screen__path">
                {kind} · {path}
              </p>
            </div>
            {onDelete ? (
              <button
                aria-label={t("editorForm.delete")}
                className="document-screen__tool"
                onClick={() =>
                  confirm({
                    confirmLabel: t("confirm.deleteDocument.action"),
                    isDanger: true,
                    message: t("confirm.deleteDocument.message"),
                    onConfirm: handleDelete,
                    title: t("confirm.deleteDocument.title", { name: title }),
                  })
                }
                title={t("editorForm.delete")}
                type="button"
              >
                <Trash2 aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </header>
      }
    >
      {confirmDialog}
      <div className="document-screen__body">
        {problems.length > 0 ? (
          <ul className="editor-notice editor-notice--warning">
            {problems.map((problem) => (
              <li className="editor-notice__item" key={problem}>
                {problem}
              </li>
            ))}
          </ul>
        ) : null}
        {message ? (
          <output className="editor-form__message">{message}</output>
        ) : null}
        {children}
      </div>
    </PanelFrame>
  );
}

/**
 * Props for DocumentScreen.
 * @property {string} [backLabel] - The back link's text
 * @property {string} [backTo] - Where the back link goes, such as the list it came from
 * @property {ReactNode} children - Form fields
 * @property {string} [deletedMessage] - Toast shown after deletion
 * @property {boolean} isDirty - Whether the draft differs from the saved file
 * @property {string} kind - Document kind shown beside its path
 * @property {() => Promise<void>} [onDelete] - Removes the document when provided
 * @property {() => Promise<void>} onSave - Persists the current draft
 * @property {string} path - Dataset-relative JSON path
 * @property {string[]} [problems] - Things worth fixing before publishing
 * @property {string} [savedMessage] - Toast shown after autosave
 * @property {string} title - Screen title
 * @property {string} [titleIconUrl] - Flag or icon shown beside the title
 * @property {unknown} value - The draft, watched so a burst of typing writes once
 */
interface DocumentScreenProps {
  backLabel?: string;
  backTo?: string;
  children: ReactNode;
  deletedMessage?: string;
  isDirty: boolean;
  kind: string;
  onDelete?: () => Promise<void>;
  onSave: () => Promise<void>;
  path: string;
  problems?: string[];
  savedMessage?: string;
  title: string;
  titleIconUrl?: string;
  value: unknown;
}
