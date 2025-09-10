
type Props = {
  center: { x: number; y: number };
  onChange: (c: { x: number; y: number }) => void;
  zoom: number;
  onZoom: (z: number) => void;
  iterations: number;               
  onIterationsChange: (i: number) => void;  
};

export default function CoordInput({
  center,
  onChange,
  zoom,
  onZoom,
  iterations,              
  onIterationsChange,       
}: Props) {
  return (
    <div className="coord-input">
      <label>
        X:
        <input
          type="number"
          value={center.x}
          onChange={e => onChange({ ...center, x: parseFloat(e.target.value) })}
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          value={center.y}
          onChange={e => onChange({ ...center, y: parseFloat(e.target.value) })}
        />
      </label>
      <label>
        Zoom:
        <input
          type="number"
          step="0.01"
          value={zoom}
          onChange={e => onZoom(parseFloat(e.target.value))}
        />
      </label>

      {/* Slider + input numérique pour les itérations */}
      <label>
        Iterations:
        <input
          type="range"
          min="1"
          max="1000"
          step="1"
          value={iterations}
          onChange={e => onIterationsChange(parseInt(e.target.value, 10))}
        />
        <input
          type="number"
          min="1"
          max="1000"
          step="1"
          value={iterations}
          onChange={e => onIterationsChange(parseInt(e.target.value, 10))}
        />
      </label>
    </div>
  );
}