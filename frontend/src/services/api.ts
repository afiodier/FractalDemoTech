export type ComputeMethod = "pixel" | "line" | "image";

export type FractalParams = {
  center: { x: number; y: number };
  zoom: number;
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
  const url = `${process.env.REACT_APP_SERVER_ADDRESS}/fractal`;
  const res = await fetch(
    `${url}?method=${params.method}&width=${params.width}&height=${params.height}&centerX=${params.center.x}&centerY=${params.center.y}&zoom=${params.zoom}`
  );
  if (!res.ok) throw new Error("Network error");
  return res.json();
}