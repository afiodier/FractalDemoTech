import { useState } from "react";
import FractalCanvas from "./components/FractalCanvas";
import CoordInput from "./components/CoordInput";
import CenterDisplay from "./components/CenterDisplay";
import { ComputeMethod } from "./services/api";

export default function App() {
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [method, setMethod] = useState<ComputeMethod>("line");

  return (
    <div className="app">
      <h1>Fractal Demo</h1>
      <div className="controls">
        <CoordInput
          center={center}
          onChange={setCenter}
          zoom={zoom}
          onZoom={setZoom}
        />
        <select
          value={method}
          onChange={e => setMethod(e.target.value as ComputeMethod)}
        >
          <option value="pixel">Per‑pixel</option>
          <option value="line">Per‑line</option>
          <option value="image">Whole image</option>
        </select>
      </div>
      <CenterDisplay center={center} />
      <FractalCanvas
        center={center}
        zoom={zoom}
        method={method}
      />
    </div>
  );
}