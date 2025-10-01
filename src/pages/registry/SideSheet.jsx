import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPersonById } from "../../services/peopleApi";
import { usePeople } from "../../store/people";

export default function SideSheet({ open, onClose, personId }) {
  const navigate = useNavigate();

  const updateStatus = usePeople((s) => s.updateStatus);
  const statusOverride = usePeople((s) => s.overrides.statusById[personId]);

  const { data: p, isLoading } = useQuery({
    queryKey: ["person", personId],
    queryFn: ({ signal }) => fetchPersonById(personId, { signal }),
    enabled: open && !!personId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  if (isLoading || !p) return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-2xl border-l border-eco-border p-5">
        <div className="text-eco-mute">Загрузка…</div>
      </div>
    </div>,
    document.body
  );

  const effectiveStatus = statusOverride ?? p.status;
  const change = (e) => updateStatus(p.id, e.target.value);

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.top="-9999px";
        document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
      } catch { return false; }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-2xl border-l border-eco-border flex flex-col">
        <div className="px-5 py-4 border-b border-eco-border flex items-center justify-between">
          <div className="min-w-0">
            <h2 id="sheet-title" className="text-base font-semibold truncate">{p.fio}</h2>
            <div className="text-eco-mute text-xs truncate">
              {p.city} • {new Date(p.birth).toLocaleDateString("ru-RU")}
            </div>
          </div>
          <button onClick={onClose} className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm">
            Закрыть
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-auto text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-eco-mute">Пол:</span> {p.gender}</div>
            <div><span className="text-eco-mute">Email:</span> {p.email}</div>
            <div><span className="text-eco-mute">Телефон:</span> {p.phone}</div>
            <div className="col-span-2"><span className="text-eco-mute">Адрес:</span> {p.regAddress}</div>
          </div>

          <div className="space-y-1">
            <div className="text-eco-mute text-xs">Статус</div>
            <select
              className="h-10 px-3 rounded-lg border border-eco-border bg-white"
              value={effectiveStatus}
              onChange={change}
            >
              <option>активен</option>
              <option>на паузе</option>
              <option>архив</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              className="h-10 px-3 rounded-lg border border-eco-border bg-white text-sm"
              onClick={() => { onClose(); navigate(`/person/${p.id}`); }}
            >
              Открыть полную карточку
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-eco-mute text-xs">Быстрые действия</div>
            <div className="flex flex-wrap gap-2">
              <button className="h-9 px-3 rounded-lg border border-eco-border bg-white" onClick={() => copy(p.email)}>Копировать email</button>
              <button className="h-9 px-3 rounded-lg border border-eco-border bg-white" onClick={() => copy(p.phone)}>Копировать телефон</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
