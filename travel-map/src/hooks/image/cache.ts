import { useEffect, useState } from "react";

const IMAGE_CACHE_NAME = "travel-map-images-v1";

const objectUrlCache = new Map<string, string>();
const pendingLoads = new Map<string, Promise<string>>();
const fallbackSources = new Set<string>();

type LoadedImageSource = {
  cachedSource: string;
  source: string;
};

function canUseCacheStorage() {
  return typeof window !== "undefined" && "caches" in window;
}

function createCachedObjectUrl(source: string, blob: Blob) {
  const cached = objectUrlCache.get(source);
  if (cached) return cached;

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(source, objectUrl);
  return objectUrl;
}

async function loadImageSource(source: string): Promise<string> {
  const objectUrl = objectUrlCache.get(source);
  if (objectUrl) return objectUrl;
  if (fallbackSources.has(source)) return source;

  const pending = pendingLoads.get(source);
  if (pending) return pending;

  const load = (async () => {
    try {
      const cache = canUseCacheStorage()
        ? await window.caches.open(IMAGE_CACHE_NAME)
        : null;
      const cachedResponse = cache ? await cache.match(source) : null;

      if (cachedResponse) {
        return createCachedObjectUrl(source, await cachedResponse.blob());
      }

      const response = await fetch(source, {
        cache: "force-cache",
        mode: "cors",
      });

      if (!response.ok)
        throw new Error(`Image request failed: ${response.status}`);

      if (cache) await cache.put(source, response.clone());
      return createCachedObjectUrl(source, await response.blob());
    } catch {
      fallbackSources.add(source);
      return source;
    } finally {
      pendingLoads.delete(source);
    }
  })();

  pendingLoads.set(source, load);
  return load;
}

export function useCachedImageSource(
  source: string | null | undefined,
  enabled = true,
) {
  const [loadedSource, setLoadedSource] = useState<LoadedImageSource | null>(
    () =>
      source && objectUrlCache.has(source)
        ? { cachedSource: objectUrlCache.get(source)!, source }
        : null,
  );
  const immediateSource = source ? objectUrlCache.get(source) : undefined;

  useEffect(() => {
    let isCancelled = false;

    if (!source || !enabled || immediateSource) {
      return () => {
        isCancelled = true;
      };
    }

    void loadImageSource(source).then((nextSource) => {
      if (!isCancelled) {
        setLoadedSource({ cachedSource: nextSource, source });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [enabled, immediateSource, source]);

  if (!source || !enabled) return undefined;
  if (immediateSource) return immediateSource;
  return loadedSource?.source === source
    ? loadedSource.cachedSource
    : undefined;
}
