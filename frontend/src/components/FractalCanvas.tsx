import { useEffect, useRef, useState } from "react";
import { fetchFractal, FractalParams, ComputeMode, ComputeMethod } from "../services/api";

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
  setZoom,
}: Props) {
  /* 1️⃣  Canvas + drag helpers */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    onCenterChange(newCenter);   // lift state up
  };

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = zoom + delta;
    setZoom(newZoom);
  };

  /* 2️⃣  Effect: redraw whenever any input changes */
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    const drawAllLines = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear the canvas once before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* --- Image mode ---------------------------------------------------- */
      if (mode === "image") {
        const blob = await fetchFractal({
          center,
          zoom,
          mode,
          method,
          width: canvas.width,
          height: canvas.height,
          iterations,
        });

        if (cancelled) return;
        const bitmap = await createImageBitmap(blob);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return;
      }

      /* --- Line mode ----------------------------------------------------- */
      if (mode === "line") {
        const totalLines = canvas.height;
        for (let y = 0; y < totalLines; y++) {
          if (cancelled) return;

          /* request the single line */
          const lineBlob = await fetchFractal(
            {
              center,
              zoom,
              mode,
              method,
              width: canvas.width,
              height: canvas.height,
              iterations,
            },
            y /* lineIndex */
          );

          /* turn PNG into a bitmap and draw it at the correct y‑offset */
          const lineBitmap = await createImageBitmap(lineBlob);
          ctx.drawImage(lineBitmap, 0, y, canvas.width, 1);
        }
        return;
      }
    };

    drawAllLines();

    return () => {
      cancelled = true;
    };
  }, [center, zoom, mode, method, iterations]);

  /* 3️⃣  Render */
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