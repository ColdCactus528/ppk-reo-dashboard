import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPersonById } from "../../services/peopleApi";
import { usePeople } from "../../store/people";
import Card from "../../components/Card";
import PersonCard from "../../components/PersonCard"; 

export default function RightPane({ open, onClose }) {
  const navigate = useNavigate();
  const selectedId = usePeople((s) => s.selectedId);
  const updateStatus = usePeople((s) => s.updateStatus);
  const statusOverride = usePeople((s) => s.overrides?.statusById?.[selectedId]);

  const { data: p, isLoading } = useQuery({
    queryKey: ["person", selectedId],
    queryFn: ({ signal }) => fetchPersonById(selectedId, { signal }),
    enabled: open && !!selectedId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (open && !selectedId) onClose?.();
  }, [open, selectedId, onClose]);

  if (!open) return null;

  return (
    <div className="col-span-5">
      <Card className="h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <div className="text-base font-semibold truncate">
              {isLoading || !p ? "Карточка" : p.fio}
            </div>
            {p && (
              <div className="text-eco-mute text-xs truncate">
                {p.city} • {new Date(p.birth).toLocaleDateString("ru-RU")}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm"
            title="Скрыть панель"
          >
            ✕
          </button>
        </div>

        {/* Быстрые действия */}
        <div className="space-y-3 mb-4">
          <div className="text-xs text-eco-mute">Быстрые действия</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              disabled={!p}
              onClick={() => p && copyToClipboard(p.email)}
            >
              Копировать email
            </button>
            <button
              className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              disabled={!p}
              onClick={() => p && copyToClipboard(p.phone)}
            >
              Копировать телефон
            </button>
            <select
              className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              disabled={!p}
              value={p ? (statusOverride ?? p.status) : "активен"}
              onChange={(e) => p && updateStatus(p.id, e.target.value)}
              title="Статус"
            >
              <option>активен</option>
              <option>на паузе</option>
              <option>архив</option>
            </select>
            <button
              className="h-9 px-3 rounded-lg border border-eco-border bg-white"
              disabled={!p}
              onClick={() => p && navigate(`/person/${p.id}`)}
            >
              Открыть полную карточку
            </button>
          </div>
        </div>

        {/* Карточка */}
        <div className="border-t border-eco-border pt-4">
          <PersonCard />
        </div>
      </Card>
    </div>
  );
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch { /* noop */ }
  }
}
