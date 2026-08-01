import "./EditorForm.scss";

import { useLanguage } from "@app/hooks/language/language";
import { classNames } from "@app/utils/className";
import { FormEvent, ReactNode, useEffect, useState } from "react";

/**
 * EditorForm component
 * Frames one dataset document with save, delete, and unsaved-change tracking.
 * Blocks a save while the document has problems so a value the public app
 * cannot load never reaches disk.
 * @component
 * @param {EditorFormProps} props
 * @param {ReactNode} props.children - Form fields
 * @param {string} props.eyebrow - Document kind shown above the title
 * @param {boolean} props.isDirty - Whether the draft differs from the saved file
 * @param {() => Promise<void>} [props.onDelete] - Removes the document when provided
 * @param {() => Promise<void>} props.onSave - Persists the current draft
 * @param {string} props.path - Dataset-relative JSON path
 * @param {string[]} [props.problems] - Reasons the draft cannot be saved
 * @param {string} props.title - Screen title
 * @param {string} [props.titleIconUrl] - Flag or icon shown beside the title
 * @returns {ReactNode} The saveable form frame
 */
export function EditorForm({
  children,
  eyebrow,
  isDirty,
  onDelete,
  onSave,
  path,
  problems = [],
  title,
  titleIconUrl,
}: EditorFormProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [message, setMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // A save reloads the page to refresh Vite's eager globs, so an unsaved draft
  // would otherwise disappear without warning.
  useEffect(() => {
    if (!isDirty) return;

    /**
     * Asks the browser to confirm leaving while a draft is unsaved.
     * @param {BeforeUnloadEvent} event - The pending unload
     * @returns {void}
     */
    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /**
   * Saves the draft unless the document still has problems.
   * @param {FormEvent<HTMLFormElement>} event - Form submit event
   * @returns {Promise<void>} Completion after the write attempt
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (problems.length > 0) {
      setIsSaved(false);
      setMessage(t("editorForm.fixProblems"));
      return;
    }
    try {
      await onSave();
      setIsSaved(true);
      setMessage(t("editorForm.saved"));
    } catch (error) {
      setIsSaved(false);
      setMessage(
        error instanceof Error ? error.message : t("editorForm.saveError"),
      );
    }
  }

  /**
   * Deletes the document once the author has confirmed.
   * @returns {Promise<void>} Completion after the delete attempt
   */
  async function handleDelete(): Promise<void> {
    if (!onDelete) return;
    try {
      await onDelete();
    } catch (error) {
      setIsConfirmingDelete(false);
      setIsSaved(false);
      setMessage(
        error instanceof Error ? error.message : t("editorForm.deleteError"),
      );
    }
  }
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">{eyebrow}</p>
          <h1 className="editor-form__title">
            {titleIconUrl ? (
              <img
                alt=""
                className="editor-form__title-icon"
                src={titleIconUrl}
              />
            ) : null}
            {title}
          </h1>
          <p className="editor__path">
            {path}
            {isDirty ? (
              <span className="editor__badge">{t("editorForm.unsaved")}</span>
            ) : null}
          </p>
        </div>
        {onDelete ? (
          <div className="editor-form__delete">
            {isConfirmingDelete ? (
              <>
                <button
                  className="editor-button editor-button--danger"
                  onClick={handleDelete}
                  type="button"
                >
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
                {t("editorForm.delete")}
              </button>
            )}
          </div>
        ) : null}
      </header>
      {problems.length > 0 ? (
        <ul className="editor-notice editor-notice--error">
          {problems.map((problem) => (
            <li className="editor-notice__item" key={problem}>
              {problem}
            </li>
          ))}
        </ul>
      ) : null}
      <form className="editor-form" onSubmit={handleSubmit}>
        {children}
        <footer className="editor-form__actions">
          <button
            className="editor-button editor-button--primary"
            disabled={!isDirty}
            type="submit"
          >
            {t("editorForm.saveChanges")}
          </button>
          <output
            className={classNames(
              "editor-form__message",
              isSaved && "editor-form__message--ok",
            )}
          >
            {message}
          </output>
        </footer>
      </form>
    </main>
  );
}

/**
 * Props for EditorForm.
 * @property {ReactNode} children - Form fields
 * @property {string} eyebrow - Document kind shown above the title
 * @property {boolean} isDirty - Whether the draft differs from the saved file
 * @property {() => Promise<void>} [onDelete] - Removes the document when provided
 * @property {() => Promise<void>} onSave - Persists the current draft
 * @property {string} path - Dataset-relative JSON path
 * @property {string[]} [problems] - Reasons the draft cannot be saved
 * @property {string} title - Screen title
 * @property {string} [titleIconUrl] - Flag or icon shown beside the title
 */
interface EditorFormProps {
  children: ReactNode;
  eyebrow: string;
  isDirty: boolean;
  onDelete?: () => Promise<void>;
  onSave: () => Promise<void>;
  path: string;
  problems?: string[];
  title: string;
  titleIconUrl?: string;
}
