import "./DocumentScreen.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import { useAutosave } from "../../hooks/useAutosave";
import { SaveChip } from "../SaveChip/SaveChip";
import { useToast } from "../Toast/Toast";

/**
 * DocumentScreen component
 * Frames one dataset document with the same autosave the trip workspace uses.
 * Replaces the previous save-and-reload form: with the dataset held in memory
 * there is nothing left for an explicit save to do, and a document that writes
 * as you edit cannot lose work to a forgotten button.
 * Problems are shown, not enforced — an in-progress document is allowed to be
 * invalid on disk, because the alternative is discarding what was just typed.
 * @component
 * @param {DocumentScreenProps} props
 * @param {ReactNode} props.children - Form fields
 * @param {string} [props.deletedMessage] - Toast shown after deletion
 * @param {string} props.eyebrow - Document kind shown above the title
 * @param {boolean} props.isDirty - Whether the draft differs from the saved file
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
  children,
  deletedMessage,
  eyebrow,
  isDirty,
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [message, setMessage] = useState("");
  const save = useAutosave(value, onSave, isDirty, {
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
      setIsConfirmingDelete(false);
      const errorMessage =
        error instanceof Error ? error.message : t("editorForm.deleteError");
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  }
  return (
    <main className="editor__screen document-screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">
            <Link className="editor-inline-link" to="/">
              <ArrowLeft aria-hidden="true" />
              {t("workspace.backToLibrary")}
            </Link>{" "}
            · {eyebrow}
          </p>
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
          <p className="editor__path">{path}</p>
        </div>
        <div className="document-screen__actions">
          <SaveChip
            error={save.error}
            onRetry={save.retry}
            savedAt={save.savedAt}
            state={save.state}
          />
          {onDelete ? (
            isConfirmingDelete ? (
              <>
                <button
                  className="editor-button editor-button--danger"
                  onClick={handleDelete}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  {t("editorForm.confirmDelete")}
                </button>
                <button
                  className="editor-button"
                  onClick={() => setIsConfirmingDelete(false)}
                  type="button"
                >
                  {t("editorForm.cancel")}
                </button>
              </>
            ) : (
              <button
                className="editor-button"
                onClick={() => setIsConfirmingDelete(true)}
                type="button"
              >
                <Trash2 aria-hidden="true" />
                {t("editorForm.delete")}
              </button>
            )
          ) : null}
        </div>
      </header>
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
      <div className="document-screen__body">{children}</div>
    </main>
  );
}

/**
 * Props for DocumentScreen.
 * @property {ReactNode} children - Form fields
 * @property {string} [deletedMessage] - Toast shown after deletion
 * @property {string} eyebrow - Document kind shown above the title
 * @property {boolean} isDirty - Whether the draft differs from the saved file
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
  children: ReactNode;
  deletedMessage?: string;
  eyebrow: string;
  isDirty: boolean;
  onDelete?: () => Promise<void>;
  onSave: () => Promise<void>;
  path: string;
  problems?: string[];
  savedMessage?: string;
  title: string;
  titleIconUrl?: string;
  value: unknown;
}
