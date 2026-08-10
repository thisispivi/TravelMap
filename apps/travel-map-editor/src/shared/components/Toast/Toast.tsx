import "./Toast.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from "react";

/** The visual and semantic tone of a toast. */
export type ToastTone = "success" | "error" | "info";

/**
 * A short-lived action message.
 * @property {string} id - Stable key used while the toast is visible
 * @property {string} message - User-facing action result
 * @property {ToastTone} tone - Visual and semantic treatment
 */
interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

/**
 * Toast actions shared by screens beneath the editor shell.
 * @property {(message: string, tone?: ToastTone) => void} showToast - Shows an action result
 */
interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 4_000;

/**
 * ToastProvider component
 * Owns editor action messages so navigation after create and delete operations
 * does not remove their confirmation.
 * @component
 * @param {PropsWithChildren} props
 * @param {ReactNode} props.children - Editor routes that can publish messages
 * @returns {ReactNode} The editor with a persistent toast host
 */
export function ToastProvider({ children }: PropsWithChildren): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Removes one visible message.
   * @param {string} id - Toast identifier
   * @returns {void}
   */
  function dismissToast(id: string): void {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  /**
   * Adds an action result and schedules its dismissal.
   * @param {string} message - User-facing action result
   * @param {ToastTone} tone - Visual and semantic treatment
   * @returns {void}
   */
  function showToast(message: string, tone: ToastTone = "success"): void {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <section
        aria-label={t("toast.notifications")}
        aria-live="polite"
        className="toast-host"
      >
        {toasts.map((toast) => (
          <article
            className={classNames("toast", `toast--${toast.tone}`)}
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 aria-hidden="true" className="toast__icon" />
            ) : toast.tone === "error" ? (
              <CircleAlert aria-hidden="true" className="toast__icon" />
            ) : (
              <Info aria-hidden="true" className="toast__icon" />
            )}
            <span className="toast__message">{toast.message}</span>
            <button
              aria-label={t("toast.dismiss")}
              className="toast__dismiss"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              <X aria-hidden="true" />
            </button>
          </article>
        ))}
      </section>
    </ToastContext.Provider>
  );
}

/**
 * Reads the editor's toast publisher.
 * @returns {ToastContextValue} The action-message publisher
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider.");
  return value;
}
