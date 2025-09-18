import Card from "./Card";

export default function Kpi({ label, value, sub }) {
  return (
    <Card>
      <div className="text-sm text-eco-mute">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-eco-mute">{sub}</div>}
    </Card>
  );
}
