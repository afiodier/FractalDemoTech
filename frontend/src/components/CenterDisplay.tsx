type Props = { center: { x: number; y: number } };

export default function CenterDisplay({ center }: Props) {
  return (
    <div className="center-display">
      Center: ({center.x.toFixed(2)}, {center.y.toFixed(2)})
    </div>
  );
}