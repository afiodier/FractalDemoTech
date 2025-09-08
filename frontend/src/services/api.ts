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
};

export type FractalResponse = {
  width: number;
  height: number;
  data: number[]; // RGBA flat array
};

export async function fetchFractal(
  params: FractalParams
): Promise<FractalResponse> {
  console.log("Fetching fractal with params:", params);
  const url = "http://localhost:5001/fractal"; //`${process.env.VITE_SERVER_ADDRESS ?? "http://localhost:5001/fractal"}/fractal`;
  const res = await fetch(
    `${url}?method=${params.method}&mode=${params.mode}&width=${params.width}&height=${params.height}&centerX=${params.center.x}&centerY=${params.center.y}&zoom=${params.zoom}`
  );

  console.log("Response status:", res.status);
  console.log("Length of data:", (await res.json()).data.length);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}