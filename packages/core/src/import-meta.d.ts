/**
 * Build-time variables injected by the consuming Vite application.
 * @property {string} VITE_CDN_PATH - Public root for authored media
 */
interface ImportMetaEnv {
  readonly VITE_CDN_PATH: string;
}

/**
 * Vite metadata available while the shared source is bundled by an app.
 * @property {ImportMetaEnv} env - Build-time environment values
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
