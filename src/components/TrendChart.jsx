import Card from "./Card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "май", value: 0.9 },
  { name: "июл", value: 1.1 },
  { name: "сен", value: 1.2 },
  { name: "ноя", value: 1.35 },
  { name: "янв", value: 1.3 },
  { name: "мар", value: 1.7 },
];

export default function TrendChart() {
  return (
    <Card title="Динамика переработки отходов" className="w-full">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
            <Line type="monotone" dataKey="value" stroke="#7CC6C4" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
