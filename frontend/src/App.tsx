import { useEffect, useState } from "react";
import FractalCanvas from "./components/FractalCanvas";
import CoordInput from "./components/CoordInput";
import MethodSelector from "./components/MethodSelector";
import CenterDisplay from "./components/CenterDisplay";
import { ComputeMethod, ComputeMode } from "./services/api";

export default function App() {
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [mode, setmode] = useState<ComputeMode>("image");
  const [method, setMethod] = useState<ComputeMethod>("go");
  const [iterations, setIterations] = useState<number>(27);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const onCenterChange = (c: { x: number; y: number }) => setCenter(c);

  const resetView = () => {
    setCenter({ x: 0, y: 0 });
    setZoom(1);
    setmode("image");
    setMethod("go");
    
  };

  return (
    <div className="app">
      <h1>Fractal Demo</h1>
      <div className="controls">
        <CoordInput center={center} onChange={setCenter} zoom={zoom} onZoom={setZoom} iterations={iterations} onIterationsChange={setIterations} />
        <MethodSelector method={method} onChange={setMethod} />
        <select value={mode} onChange={e => setmode(e.target.value as ComputeMode)}>
          <option value="pixel">Per‑pixel</option>
          <option value="line">Per‑line</option>
          <option value="image">Whole image</option>
        </select>
        <button type="button" onClick={resetView} className="reset-btn">Reset View</button>
      </div>
      <CenterDisplay center={center} />
      <FractalCanvas
        center={center}
        zoom={zoom}
        setZoom={setZoom}
        method={method}
        iterations={iterations}
        mode={mode}
        width={size.width}
        height={size.height}
        onCenterChange={onCenterChange}
      />
    </div>
  );
}