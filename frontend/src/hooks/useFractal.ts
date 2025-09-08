import { useState, useEffect } from "react";
import { fetchFractal, FractalParams, FractalResponse } from "../services/api";

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchAll = async () => {
      try {
        // ---- MODE LINE ----
        if (params.mode === "line") {
          // 1️⃣ Create an empty buffer for the whole image
          const full = new Uint8ClampedArray(params.width * params.height * 4);

          // 2️⃣ Loop over each line (y)
          for (let y = 0; y < params.height; y++) {
            // a) Call the API for one line
            const res = await fetchFractal(params, y);

            // b) The response contains only the current line:
            //    - width == params.width
            //    - height == 1
            //    - data.length == width * 4
            if (res.height !== 1) {
              throw new Error(`Expected height 1, got ${res.height}`);
            }

            // c) Copy the line into the full buffer
            const src = new Uint8ClampedArray(res.data);
            const dstStart = y * params.width * 4;
            full.set(src, dstStart);
          }

          // 3️⃣ Build the final response object
          setData({ width: params.width, height: params.height, data: Array.from(full) });
        } else {
          // ---- MODE IMAGE / PIXEL ----
          const full = await fetchFractal(params);
          setData(full);
        }
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();

    return () => { cancelled = true; };
  }, [params]);

  return { data, loading, error };
}