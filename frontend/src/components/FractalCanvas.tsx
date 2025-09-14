// frontend/src/components/FractalCanvas.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useFractal } from '../hooks/useFractal';

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
    onCenterChange(newCenter);
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


    useEffect(() => {
    if (!canvasRef.current || !blob) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, rendered, width, mode == 'image' ? height : 1);
      URL.revokeObjectURL(url);
    };
    img.onerror = err => console.error('Failed to load fractal image', err);

    img.src = url;
  }, [blob, width, height, rendered]);


  useEffect(() => {
    if (!canvasRef.current || !blob) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

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