import { arrayBuffer } from "stream/consumers";

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

export type FractalResponse = {
  width: number;
  height: number;
  data: number[]; // RGBA flat array
};

export async function fetchFractal(
  params: FractalParams,
  lineIndex?: number,
   signal?: AbortSignal 
): Promise<FractalResponse> {
  const query = new URLSearchParams({
    method: params.method,
    mode:   params.mode,
    width:  params.width.toString(),
    height: params.height.toString(),
    centerX: params.center.x.toString(),
    centerY: params.center.y.toString(),
    zoom:   params.zoom.toString(),
    ...(lineIndex !== undefined && { line: lineIndex.toString() }),
    ...(params.iterations !== undefined && { iterations: params.iterations.toString() })
  });

  const url = `http://localhost:5001/fractal?${query.toString()}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}