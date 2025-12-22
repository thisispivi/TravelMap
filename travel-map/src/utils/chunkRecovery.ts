const STORAGE_KEY = "travel-map:chunk-recovery:last-reload";
const RELOAD_COOLDOWN_MS = 5 * 60 * 1000;

function asMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  try {
    return String(value);
  } catch {
    return "";
  }
}

function isLikelyDynamicImportFailure(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("error loading dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("chunkloaderror") ||
    normalized.includes("loading chunk") ||
    normalized.includes("unable to preload css")
  );
}

function reloadOnceWithCacheBusting(): void {
  const now = Date.now();
  const lastReload = Number(sessionStorage.getItem(STORAGE_KEY));

  if (!Number.isNaN(lastReload) && now - lastReload < RELOAD_COOLDOWN_MS) {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, String(now));

  const url = new URL(window.location.href);
  url.searchParams.set("__chunk_reload", String(now));

  window.location.replace(url.toString());
}

export function installChunkRecoveryHandlers(): void {
  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      const message = asMessage(event.reason);
      if (isLikelyDynamicImportFailure(message)) {
        reloadOnceWithCacheBusting();
      }
    }
  );

  window.addEventListener("error", (event: Event) => {
    const errorEvent = event as ErrorEvent;

    const message =
      typeof errorEvent?.message === "string" ? errorEvent.message : "";

    if (message && isLikelyDynamicImportFailure(message)) {
      reloadOnceWithCacheBusting();
      return;
    }

    const errorMessage = asMessage(errorEvent?.error);
    if (errorMessage && isLikelyDynamicImportFailure(errorMessage)) {
      reloadOnceWithCacheBusting();
    }
  });
}
