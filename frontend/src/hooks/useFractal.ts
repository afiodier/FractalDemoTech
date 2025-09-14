import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchFractal, FractalParams} from '../services/api';
import throttle from 'lodash.throttle';

/**
 * Hook that fetches a fractal image from the API.
 *
 * Guarantees:
 * 1. Only one request in flight at a time.
 * 2. If the component re‑renders (i.e. `params` changes) the old request is aborted.
 * 3. Any pending throttled calls are cancelled immediately.
 */
export function useFractal(
  params: FractalParams
): { blob: Blob | null; rendered: number; loading: boolean; error: Error | null } {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rendered, setRendered] = useState<number>(0);

  const abortCtrlRef = useRef<AbortController | null>(null);

  async function concatBlobs(...blobs : Blob[]): Promise<Blob> {
    const buffers = await Promise.all(
      blobs.map(blob => blob.arrayBuffer())
    );

    const totalSize = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const merged = new Uint8Array(totalSize);
    let offset = 0;
    for (const buf of buffers) {
      merged.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Blob([merged.buffer], { type: blobs[0].type });
  }

  const throttledFetch = useCallback(
    throttle(async (p: FractalParams) => {
      const controller = new AbortController();
      abortCtrlRef.current = controller;

      try {
        let result : Blob = new Blob();

        if (p.mode === "line") {
          for (let y = 0; y < p.height; y++) {
            if (controller.signal.aborted) return;
            const full = await fetchFractal({ params: p, lineIndex:y, signal: controller.signal });
            result = await concatBlobs(result, full);
            setRendered(y);
            setBlob(full);
          }

          setRendered(p.height);
          setBlob(result);
        } else {
          const full = await fetchFractal({ params: p, signal: controller.signal });
          abortCtrlRef.current.abort();

          setRendered(0);
          setBlob(full);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e);
      } finally {
        setLoading(false);
      }
    }, 3000),
    []
  );

  useEffect(() => {
    abortCtrlRef.current?.abort();

    setLoading(true);
    throttledFetch.cancel();
    throttledFetch(params);

    return () => {
      abortCtrlRef.current?.abort();
    };
  }, [params.center, params.zoom, params.iterations, params.width, params.height, params.mode, params.method]);

  useEffect(() => {
    console.log(params);
  }, [params.center, params.zoom, params.iterations, params.width, params.height, params.mode, params.method]);

  return { blob, rendered, loading, error };
}