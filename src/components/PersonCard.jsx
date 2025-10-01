import { useState } from "react";
import Card from "./Card";
import { usePeople } from "../store/people";
import { useQuery } from "@tanstack/react-query";
import { fetchPersonById } from "../services/peopleApi";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-eco-mute">{label}</span>
      {children}
    </label>
  );
}

export default function PersonCard() {
  const id = usePeople((s) => s.selectedId);
  const statusOverride = usePeople((s) => (id ? s.overrides?.statusById?.[id] : undefined));
  const [tab, setTab] = useState("summary");

  const { data: p, isLoading, isError } = useQuery({
    queryKey: ["person", id],
    queryFn: ({ signal }) => fetchPersonById(id, { signal }),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (!id) {
    return (
      <Card className="h-full">
        <div className="text-eco-mute">Выберите человека из списка</div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="animate-pulse text-eco-mute">Загружаем карточку…</div>
      </Card>
    );
  }

  if (isError || !p) {
    return (
      <Card className="h-full">
        <div className="text-rose-600">Не удалось загрузить карточку</div>
      </Card>
    );
  }

  const effStatus = statusOverride ?? p.status;

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-semibold">{p.fio}</div>
          <div className="text-eco-mute text-sm">
            {p.city} • {new Date(p.birth).toLocaleDateString("ru-RU")}
          </div>
        </div>

        <div className="flex gap-2">
          {["summary", "main", "contacts"].map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-1 rounded-full text-sm ${
                tab === k ? "bg-eco-green/30" : "bg-eco-bg text-eco-mute"
              }`}
            >
              {{ summary: "Сводка", main: "Основные", contacts: "Контакты" }[k]}
            </button>
          ))}
        </div>
      </div>

      {tab === "summary" && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-eco-mute">Пол:</span> {p.gender}
          </div>
          <div>
            <span className="text-eco-mute">Статус:</span> {effStatus}
          </div>
          <div className="col-span-2">
            <span className="text-eco-mute">Адрес регистрации:</span> {p.regAddress}
          </div>
        </div>
      )}

      {tab === "main" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="ФИО">
            <input
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.fio}
            />
          </Field>
          <Field label="Пол">
            <select
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.gender}
            >
              <option>муж</option>
              <option>жен</option>
            </select>
          </Field>
          <Field label="Дата рождения">
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.birth.slice(0, 10)}
            />
          </Field>
        </div>
      )}

      {tab === "contacts" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Телефон">
            <input
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.phone}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.email}
            />
          </Field>
          <Field label="Адрес регистрации">
            <textarea
              className="px-3 py-2 rounded-lg border border-eco-border"
              defaultValue={p.regAddress}
            />
          </Field>
        </div>
      )}
    </Card>
  );
}
