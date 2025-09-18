import Kpi from "../components/Kpi";
import Card from "../components/Card";
import TrendChart from "../components/TrendChart";
import { nf } from "../lib/num";

export default function Dashboard() {
  const totalWaste = 1_820_000;
  const recycled   = 1_230_000;
  const pickups    = 8_945;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <Kpi label="Отходов собрано" value={`${nf(totalWaste)} т`} sub="год к дате" />
      </div>
      <div className="col-span-4">
        <Kpi label="Переработано" value={`${nf(recycled)} т`} sub="год к дате" />
      </div>
      <div className="col-span-4">
        <Kpi label="Вывозов за месяц" value={nf(pickups)} />
      </div>

      <div className="col-span-8">
        <TrendChart />
      </div>

      <div className="col-span-4">
        <Card>
          <div className="text-sm text-eco-mute mb-2">Картотека заявок (срез)</div>
          <div className="text-eco-mute text-sm">будет позже</div>
        </Card>
      </div>
    </div>
  );
}
