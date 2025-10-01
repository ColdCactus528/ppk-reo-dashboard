import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import SavedViews from "./SavedViews";
import ColumnsMenu from "./ColumnsMenu";

export default function SettingsModal({
  open, onClose,
  visibleKeys, setVisibleKeys,
  density, setDensity,
  sortSpec, setSortSpec,
  snapshot, applySnapshot,
}) {
  const [localSort, setLocalSort] = useState(sortSpec);
  useEffect(() => { if (open) setLocalSort(sortSpec); }, [open, sortSpec]);

  const apply = () => { setSortSpec(localSort); onClose?.(); };

  return (
    <Modal open={open} onClose={onClose} title="Настройки" okText="Закрыть">
      <div className="space-y-6">
        <section>
          <div className="text-xs text-eco-mute mb-2">Колонки и плотность</div>
          <ColumnsMenu
            all={[
              { key: "id", label: "ID" },
              { key: "fio", label: "ФИО" },
              { key: "birth", label: "Рождение" },
              { key: "gender", label: "Пол" },
              { key: "city", label: "Город" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Телефон" },
              { key: "status", label: "Статус" },
            ]}
            visibleKeys={visibleKeys}
            setVisibleKeys={setVisibleKeys}
            density={density}
            setDensity={setDensity}
          />
        </section>

        <section>
          <div className="text-xs text-eco-mute mb-2">Сортировки (пресеты)</div>
          <div className="flex flex-wrap gap-2">
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              onClick={() => setLocalSort([{ key: "fio", dir: "asc" }])}>ФИО ↑</button>
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              onClick={() => setLocalSort([{ key: "fio", dir: "desc" }])}>ФИО ↓</button>
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              onClick={() => setLocalSort([{ key: "city", dir: "asc" }, { key: "fio", dir: "asc" }])}>
              Город ↑, ФИО ↑
            </button>
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              onClick={() => setLocalSort([])}>Сброс</button>
          </div>
        </section>

        <section>
          <div className="text-xs text-eco-mute mb-2">Представления</div>
          <SavedViews snapshot={snapshot} applySnapshot={applySnapshot} />
        </section>

        <div className="flex justify-end">
          <button className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm" onClick={apply}>
            Применить
          </button>
        </div>
      </div>
    </Modal>
  );
}
