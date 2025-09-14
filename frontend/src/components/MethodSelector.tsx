import { ComputeMethod } from "../services/api";

type Props = {
  method: ComputeMethod;
  onChange: (m: ComputeMethod) => void;
};

export default function MethodSelector({ method, onChange }: Props) {
  return (
    <label className="method-selector">
      Backend:
      <select
        value={method}
        onChange={e => onChange(e.target.value as ComputeMethod)}
      >
        <option value="go">Go</option>
        <option value="node">Node</option>
        <option value="csharp">C#</option>
      </select>
    </label>
  );
}