import Modal from "../../components/Modal";
import { useEffect, useMemo, useState } from "react";

const EMPTY = {
  statuses: [],      // только чекбоксы статусов
  genders: [],       // ["муж","жен"]
  cities: [],        // массив городов
  emailDomains: [],  // массив доменов
  hasEmail: null,    // true|false|null
  hasPhone: null,    // true|false|null
  age: [null, null], // [min,max]
  birth: ["", ""],   // ["YYYY-MM-DD","YYYY-MM-DD"]
};

function countActive(f = EMPTY) {
  let n = 0;
  if (f.statuses?.length) n++;
  if (f.genders?.length) n++;
  if (f.cities?.length) n++;
  if (f.emailDomains?.length) n++;
  if (f.hasEmail != null) n++;
  if (f.hasPhone != null) n++;
  if (f.age && (f.age[0] != null || f.age[1] != null)) n++;
  if (f.birth && (f.birth[0] || f.birth[1])) n++;
  return n;
}

export default function FilterModal({
  open,
  onClose,
  filters = EMPTY,
  setFilters = () => {},
}) {
  const [local, setLocal] = useState({ ...EMPTY, ...filters });

  useEffect(() => {
    if (open) setLocal({ ...EMPTY, ...filters });
  }, [open, filters]);

  const active = useMemo(() => countActive(local), [local]);

  const apply = () => {
    setFilters({ ...EMPTY, ...local });
    onClose?.();
  };

  const Checkbox = ({ checked, onChange, label }) => (
    <label className="inline-flex items-center gap-2 mr-4">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );

  return (
    <Modal open={open} onClose={onClose} title="Фильтры" okText="Закрыть">
      <div className="space-y-5 text-sm">
        <div>
          <div className="text-xs text-eco-mute mb-1">Статусы</div>
          {["активен","на паузе","архив"].map(s => (
            <Checkbox
              key={s}
              checked={local.statuses.includes(s)}
              onChange={(e) => {
                const next = new Set(local.statuses);
                e.target.checked ? next.add(s) : next.delete(s);
                setLocal((v)=>({ ...v, statuses: Array.from(next) }));
              }}
              label={s}
            />
          ))}
        </div>

        {/* Пол */}
        <div>
          <div className="text-xs text-eco-mute mb-1">Пол</div>
          {["муж","жен"].map(g => (
            <Checkbox
              key={g}
              checked={local.genders.includes(g)}
              onChange={(e) => {
                const next = new Set(local.genders);
                e.target.checked ? next.add(g) : next.delete(g);
                setLocal((v)=>({ ...v, genders: Array.from(next) }));
              }}
              label={g}
            />
          ))}
        </div>

        {/* Города и домены email */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Города (через запятую)</span>
            <input
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.cities.join(", ")}
              onChange={(e)=>{
                const arr = e.target.value.split(",").map(s=>s.trim()).filter(Boolean);
                setLocal(v=>({ ...v, cities: arr }));
              }}
              placeholder="Москва, Казань"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Домены email (через запятую)</span>
            <input
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.emailDomains.join(", ")}
              onChange={(e)=>{
                const arr = e.target.value.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
                setLocal(v=>({ ...v, emailDomains: arr }));
              }}
              placeholder="gmail.com, yandex.ru"
            />
          </label>
        </div>

        {/* Есть email / телефон */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Есть email</span>
            <select
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.hasEmail ?? ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, hasEmail: e.target.value === "" ? null : e.target.value === "true" }))
              }
            >
              <option value="">Не важно</option>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Есть телефон</span>
            <select
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.hasPhone ?? ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, hasPhone: e.target.value === "" ? null : e.target.value === "true" }))
              }
            >
              <option value="">Не важно</option>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        </div>

        {/* Возраст */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Возраст от</span>
            <input
              type="number"
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.age[0] ?? ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, age: [e.target.value ? Number(e.target.value) : null, s.age[1]] }))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Возраст до</span>
            <input
              type="number"
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.age[1] ?? ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, age: [s.age[0], e.target.value ? Number(e.target.value) : null] }))
              }
            />
          </label>
        </div>

        {/* Дата рождения */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Дата рождения от</span>
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.birth[0] || ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, birth: [e.target.value || "", s.birth[1]] }))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-eco-mute">Дата рождения до</span>
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-eco-border"
              value={local.birth[1] || ""}
              onChange={(e) =>
                setLocal((s) => ({ ...s, birth: [s.birth[0], e.target.value || ""] }))
              }
            />
          </label>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-eco-mute">Активных фильтров: {active}</div>
          <div className="flex gap-2">
            <button
              className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm"
              onClick={() => setLocal(EMPTY)}
            >
              Сбросить
            </button>
            <button
              className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm"
              onClick={apply}
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
