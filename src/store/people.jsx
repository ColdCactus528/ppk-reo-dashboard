import { create } from "zustand";

export const usePeople = create((set, get) => ({
  // ui
  query: "",
  status: "all",
  selectedId: null,

  setQuery: (q) => set({ query: q }),
  setStatus: (s) => set({ status: s }),
  select:   (id) => set({ selectedId: id }),

  // переопределения данных на клиенте (например, статус по id)
  overrides: {
    statusById: {},     // { [id]: "активен" | "на паузе" | "архив" }
  },

  // публичный апдейтер (использует SideSheet/массовые действия)
  updateStatus: (id, newStatus) => {
    if (!id || !newStatus) return;
    const cur = get().overrides.statusById;
    if (cur[id] === newStatus) return;
    set({
      overrides: { statusById: { ...cur, [id]: newStatus } },
    });
  },
}));
