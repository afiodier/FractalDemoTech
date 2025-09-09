/* -----------------  frontend/src/components/FractalCanvas.tsx  ----------------- */
import { useEffect, useRef, useState } from "react";
import { fetchFractal } from "../services/api";
import { ComputeMode, ComputeMethod } from "../services/api";

type Props = {
  center: { x: number; y: number };
  zoom: number;
  mode: ComputeMode;
  method: ComputeMethod;
  iterations?: number;
  onCenterChange: (c: { x: number; y: number }) => void;
  setZoom: (z: number) => void;
};

export default function FractalCanvas({
  center,
  zoom,
  mode,
  method,
  iterations,
  onCenterChange,
  setZoom
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  /*  1. Drag state + helpers  */
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current || !canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    const dx = e.nativeEvent.offsetX - dragStart.current.x;
    const dy = e.nativeEvent.offsetY - dragStart.current.y;
    const newCenter = {
      x: center.x - (dx / width) * 2 / zoom,
      y: center.y - (dy / height) * 2 / zoom,
    };
    onCenterChange(newCenter);   // <‑‑ lift the state up
  };

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom += delta;
    setZoom(zoom);
  };

  useEffect(() => {
    draw();
  }, [center, zoom, mode, method, iterations]);

  const draw = async () => {
    if (!canvasRef.current) return;
    const img = await fetchFractal({
      center,
      zoom,
      mode,
      method,
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      iterations
    });
    const ctx = canvasRef.current.getContext("2d");
    const imgData = new ImageData(
      new Uint8ClampedArray(img.data),
      img.width,
      img.height
    );
    ctx?.putImageData(imgData, 0, 0);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
    />
  );
}