import { useState, startTransition } from "react";
import Modal from "../../components/Modal";

const KEY = "registry.views.v1";
const safeParse = (s, d) => { try { return JSON.parse(s); } catch { return d; } };

export default function SavedViews({ snapshot, applySnapshot }) {
  const [views, setViews] = useState(() => safeParse(localStorage.getItem(KEY), []));
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");

  // модалка
  const [dlg, setDlg] = useState({ open: false, title: "", text: "" });
  const show = (title, text, autoCloseMs) =>
    setDlg({ open: true, title, text, autoCloseMs });
  const close = () => setDlg({ open: false, title: "", text: "" });

  const persist = (next) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setViews(next);
  };

  const save = () => {
    const n = name.trim();
    if (!n) {
      show("Не сохранено", "Введите имя представления.");
      return;
    }
    const next = [...views.filter(v => v.name !== n), { name: n, ...snapshot }];
    persist(next);
    show("Сохранено", `Представление «${n}» сохранено.`, 1200);
  };

  const load = () => {
    const v = views.find(x => x.name === selected);
    if (!v) {
      show("Не загружено", "Выберите представление из списка.");
      return;
    }
    startTransition(() => applySnapshot(v));
    show("Загружено", `Представление «${v.name}» применено.`, 1200);
  };

  const remove = () => {
    const v = views.find(x => x.name === selected);
    if (!v) {
      show("Не удалено", "Выберите представление из списка.");
      return;
    }
    persist(views.filter(x => x.name !== v.name));
    setSelected("");
    show("Удалено", `Представление «${v.name}» удалено.`, 1200);
  };

  return (
    <>
      <div className="ml-2 flex flex-wrap items-center gap-2 whitespace-nowrap">
        <input
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
          placeholder="Имя представления"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
          onClick={save}
        >
          Сохранить
        </button>

        <select
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Представления…</option>
          {views.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
        </select>
        <button
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm disabled:opacity-50"
          disabled={!selected}
          onClick={load}
        >
          Загрузить
        </button>
        <button
          className="h-11 px-3 rounded-xl border border-eco-border bg-white text-sm disabled:opacity-50"
          disabled={!selected}
          onClick={remove}
        >
          Удалить
        </button>
      </div>

      <Modal open={dlg.open} onClose={close} title={dlg.title} autoCloseMs={dlg.autoCloseMs}>
        {dlg.text}
      </Modal>
    </>
  );
}
