import { useState } from "react";

export default function ColumnsMenu({ all, visibleKeys, setVisibleKeys, density, setDensity }) {
  const [open, setOpen] = useState(false);

  const toggle = (k) => {
    const has = visibleKeys.includes(k);
    if (has) {
      if (visibleKeys.length === 1) return;
      setVisibleKeys(visibleKeys.filter((x) => x !== k));
    } else {
      setVisibleKeys([...visibleKeys, k]);
    }
  };

  return (
    <div className="relative ml-auto">
      <button
        className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
        onClick={() => setOpen((o) => !o)}
      >
        Настроить
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white border border-eco-border rounded-xl shadow-soft p-3 z-10"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="text-xs text-eco-mute mb-2">Колонки</div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            {all.map((c) => (
              <label key={c.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleKeys.includes(c.key)}
                  onChange={() => toggle(c.key)}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <div className="text-xs text-eco-mute mt-3 mb-1">Плотность</div>
          <select
            className="h-10 px-2 rounded-lg border border-eco-border bg-white w-full text-sm"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          >
            <option value="compact">Компактная</option>
            <option value="comfortable">Обычная</option>
            <option value="spacious">Свободная</option>
          </select>
        </div>
      )}
    </div>
  );
}
