// frontend/src/components/FractalCanvas.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useFractal } from '../hooks/useFractal';
import { FractalResponse } from '../services/api';

type Props = {
  center: { x: number; y: number };
  zoom: number;
  mode: 'pixel' | 'line' | 'image';
  method: 'go' | 'node' | 'csharp';
  width: number;
  height: number;
  iterations?: number;
  onCenterChange: (c: { x: number; y: number }) => void;
  setZoom: (z: number) => void;
};

export default function FractalCanvas({
  center,
  zoom,
  mode,
  method,
  width,
  height,
  iterations,
  onCenterChange,
  setZoom,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hook that does the fetch + cancel logic
  const { blob, rendered, loading, error } = useFractal({
    center,
    zoom,
    mode,
    method,
    width,
    height,
    iterations,
  });

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

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = zoom + delta;
    setZoom(newZoom);
  };

  // Draw the image when data arrives
    useEffect(() => {
    if (!canvasRef.current || !blob) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 1️⃣ Create a temporary object URL from the Blob
    const url = URL.createObjectURL(blob);
    //const lineBitmap = createImageBitmap(blob);

    // 2️⃣ Use an Image to load that URL
    const img = new Image();
    img.onload = () => {
      // 3️⃣ Draw the image onto the canvas
      ctx.drawImage(img, 0, rendered, width, mode == 'image' ? height : 1);

      // 4️⃣ Clean‑up: revoke the URL (free memory)
      URL.revokeObjectURL(url);
    };
    img.onerror = err => console.error('Failed to load fractal image', err);

    img.src = url;          // start loading
  }, [blob, width, height, rendered]);

    // Draw the image when data arrives
    useEffect(() => {
    if (!canvasRef.current || !blob) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    
    // Optional: if you ever want to clear the canvas on unmount
    return () => {
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height, mode, method, zoom, center, iterations]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error.message}</div>}
      <canvas ref={canvasRef} width={width} height={height} 
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}/>
    </div>
  );
}