import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

/* MapLibre 6 cannot locate its ESM worker after Vite bundles the library. */
setWorkerUrl(workerUrl);
