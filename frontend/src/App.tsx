import { useState } from "react";
import FractalCanvas from "./components/FractalCanvas";
import CoordInput from "./components/CoordInput";
import CenterDisplay from "./components/CenterDisplay";
import { ComputeMode, ComputeMethod } from "./services/api";
import MethodSelector from "./components/MethodSelector";

export default function App() {
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [mode, setmode] = useState<ComputeMode>("image");
  const [method, setMethod] = useState<ComputeMethod>("go");

   const resetView = () => {
    setCenter({ x: 0, y: 0 });
    setZoom(1);
    setmode("image");   // <-- your preferred default
    setMethod("go");
  };

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

        <MethodSelector method={method} onChange={setMethod} />

        <select
          value={mode}
          onChange={e => setmode(e.target.value as ComputeMode)}
        >
          <option value="pixel">Per‑pixel</option>
          <option value="line">Per‑line</option>
          <option value="image">Whole image</option>
        </select>
         <button
          type="button"
          onClick={resetView}
          className="reset-btn"
        >
          Reset View
        </button>
      </div>
      <CenterDisplay center={center} />
      <FractalCanvas
        center={center}
        zoom={zoom}
        method={method}
        mode={mode}
      />
    </div>
  );
}