import { useMemo, useState } from "react";
import FilterModal from "./FilterModal";
import SettingsModal from "./SettingsModal";

export default function TableToolbar({
  q, setQ,
  total,
  view, setView,

  // настройки таблицы
  visibleKeys, setVisibleKeys,
  density, setDensity,
  sortSpec, setSortSpec,
  snapshot, applySnapshot,

  // фильтры модалки
  filters, setFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const totalText = useMemo(
    () => (total != null ? total.toLocaleString("ru-RU") : "—"),
    [total]
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Поиск: ФИО / email / ≥5 цифр телефона */}
        <input
          className="px-3 py-2 rounded-lg border border-eco-border bg-white outline-none"
          placeholder="Поиск ФИО / email / Тел"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {/* Счётчик */}
        <div className="text-eco-mute text-sm">Всего: {totalText}</div>

        {/* Фильтры (модалка) */}
        <button
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
          onClick={() => setFiltersOpen(true)}
        >
          Фильтры
        </button>

        {/* Настройки/представления/колонки/плотность/сортировки */}
        <button
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
          onClick={() => setSettingsOpen(true)}
        >
          Настроить
        </button>

        {/* Переключатель вида */}
        <div className="ml-auto flex items-center gap-1">
          <button
            className={`h-9 px-3 rounded-lg border text-sm ${
              view === "table"
                ? "border-eco-border bg-white"
                : "border-transparent hover:border-eco-border bg-eco-bg"
            }`}
            onClick={() => setView("table")}
          >
            Таблица
          </button>
          <button
            className={`h-9 px-3 rounded-lg border text-sm ${
              view === "cards"
                ? "border-eco-border bg-white"
                : "border-transparent hover:border-eco-border bg-eco-bg"
            }`}
            onClick={() => setView("cards")}
          >
            Карточки
          </button>
        </div>
      </div>

      {/* Модалки */}
      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        visibleKeys={visibleKeys}
        setVisibleKeys={setVisibleKeys}
        density={density}
        setDensity={setDensity}
        sortSpec={sortSpec}
        setSortSpec={setSortSpec}
        snapshot={snapshot}
        applySnapshot={applySnapshot}
      />
    </>
  );
}
