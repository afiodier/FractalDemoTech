import { useState, useEffect, useCallback, useRef } from "react";
import { fetchFractal, FractalParams, FractalResponse } from "../services/api";
import throttle from "lodash.throttle";

/**
 * A reusable hook that fetches a fractal image from the API.
 *
 * @param params   The request parameters (center, zoom, mode, etc.)
 * @returns { data, loading, error }
 */
export function useFractal(
  params: FractalParams
): { data: FractalResponse | null; loading: boolean; error: Error | null } {
  const [data, setData]   = useState<FractalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<Error | null>(null);

  const abortCtrlRef = useRef<AbortController | null>(null);

 const throttledFetch = useCallback(
    throttle(async (p: FractalParams) => {
      const controller = new AbortController();
      abortCtrlRef.current = controller;
      try {
        // ---- MODE LINE ----
        if (p.mode === "line") {
          const full = new Uint8ClampedArray(p.width * p.height * 4);

          for (let y = 0; y < p.height; y++) {
            // a) Call the API for one line
            const res = await fetchFractal(p, y, controller.signal);
            if (y < p.height - 1) {
              setData({ width: p.width, height: y + 1, data: Array.from(full) });
            }

            // b) The response contains only the current line:
            //    - width == params.width
            //    - height == 1
            //    - data.length == width * 4
            if (res.height !== 1) {
              throw new Error(`Expected height 1, got ${res.height}`);
            }

            // c) Copy the line into the full buffer
            const src = new Uint8ClampedArray(res.data);
            const dstStart = y * p.width * 4;
            full.set(src, dstStart);
          }

          setData({ width: p.width, height: p.height, data: Array.from(full) });
        } else {
          // ---- MODE IMAGE / PIXEL ----
          const full = await fetchFractal(p, undefined, controller.signal);
          abortCtrlRef.current.abort();
          setData(full);
        }

      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }, 300),           // 300 ms throttle
    []
  );

  useEffect(() => {
     if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();   // <-- cancel previous request
    }

    setLoading(true);
    throttledFetch.cancel?.();
    throttledFetch(params);

    return () => {
      if (abortCtrlRef.current) {
        abortCtrlRef.current.abort();
      }
    };

  }, [params, throttledFetch]);

  return { data, loading, error };
}