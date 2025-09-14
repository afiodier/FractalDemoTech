export type ComputeMode = "pixel" | "line" | "image";
export type ComputeMethod = "go" | "node" | "csharp";

export type FractalParams = {
  center: { x: number; y: number };
  zoom: number;
  mode: ComputeMode;
  method: ComputeMethod;
  width: number;
  height: number;
  iterations?: number; 
};

type fractalFetchOptions = {
  params: FractalParams;
  lineIndex?: number;
  signal?: AbortSignal;
};

export async function fetchFractal({ params, lineIndex, signal }: fractalFetchOptions
): Promise<Blob> {
  const query = new URLSearchParams({
    method: params.method,
    mode:   params.mode,
    width:  params.width.toString(),
    height: params.height.toString(),
    centerX: params.center.x.toString(),
    centerY: params.center.y.toString(),
    zoom:   params.zoom.toString(),
    ...(lineIndex !== undefined && { lineIdx: lineIndex.toString() }),
    ...(params.iterations !== undefined && { iterations: params.iterations.toString() })
  });

  const url = `http://localhost:5001/fractal?${query.toString()}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.blob();
}