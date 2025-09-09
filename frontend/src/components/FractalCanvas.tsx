import { useRef, useEffect } from "react";
import { fetchFractal } from "../services/api";
import { ComputeMode, ComputeMethod } from "../services/api";

type Props = {
  center: { x: number; y: number };
  zoom: number;
  mode: ComputeMode;
  method: ComputeMethod;  
};

export default function FractalCanvas({ center, zoom, mode, method }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom & drag handling
  useEffect(() => {
    const canvas = canvasRef.current!;
    let isDragging = false;
    let startX = 0,
      startY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoom += delta;
      draw();
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      center.x -= dx * (1 / zoom);
      center.y -= dy * (1 / zoom);
      startX = e.clientX;
      startY = e.clientY;
      draw();
    };

    const onMouseUp = () => (isDragging = false);

    canvas.addEventListener("wheel", onWheel);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    draw();

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [center, zoom, mode, method]);

  const draw = async () => {
    if (!canvasRef.current) return;
    const img = await fetchFractal({
      center,
      zoom,
      mode,
      method,
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    });
    const ctx = canvasRef.current.getContext("2d");
    const imgData = new ImageData(
      new Uint8ClampedArray(img.data),
      img.width,
      img.height
    );
    ctx?.putImageData(imgData, 0, 0);
  };

  return <canvas ref={canvasRef} width={500} height={500} />;
}