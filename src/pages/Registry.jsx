import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as RW from "react-window";

import Card from "../components/Card";
import { fetchPeople } from "../services/peopleApi";
import { usePeople } from "../store/people";

import Row from "./registry/Row.jsx";
import CardsGrid from "./registry/CardsGrid.jsx";
import TableToolbar from "./registry/TableToolbar.jsx";
import RightPane from "./registry/RightPane.jsx";

const List = RW.List;

const ALL_COLS = [
  { key: "id",     label: "ID",        width: "56px"  },
  { key: "fio",    label: "ФИО",       width: "1.4fr" },
  { key: "birth",  label: "Рождение",  width: "110px" },
  { key: "gender", label: "Пол",       width: "80px"  },
  { key: "city",   label: "Город",     width: "140px" },
  { key: "email",  label: "Email",     width: "1.2fr" },
  { key: "status", label: "Статус",    width: "120px" },
];

const LS_COLS = "registry.cols.v1";
const LS_DENS = "registry.density.v1";
const LS_VIEW = "registry.view.v1";
const LS_SORT = "registry.sort.v1";

/* --- лайт-скелетоны --- */
function Skeleton({ className = "" }) { return <div className={`animate-pulse bg-eco-bg rounded ${className}`} />; }
function TableSkeletonInline({ template, rowHeight = 52, rows = 10 }) {
  const colCount = (template?.trim().split(/\s+/).length ?? 0);
  return (
    <div>
      <div className="grid px-3 py-2 text-sm bg-eco-bg text-eco-mute border-b border-eco-border" style={{ gridTemplateColumns: template }}>
        {Array.from({ length: colCount }).map((_, i) => <Skeleton key={i} className="h-4 w-24" />)}
      </div>
      <div style={{ height: 520, width: "100%" }} className="overflow-x-hidden">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid items-center px-3 border-b border-eco-border" style={{ gridTemplateColumns: template, height: rowHeight }}>
            {Array.from({ length: colCount }).map((__, c) => <Skeleton key={c} className="h-4 w-[70%]" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
function CardsGridSkeletonInline({ count = 12 }) {
  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-eco-border rounded-xl p-4 bg-white">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
/* ---------------------- */

// CSV helpers
function rowsToCSV(rows, cols) {
  const header = ["id", ...cols.map((c) => c.label)].join(",");
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const mapVal = (r, key) => key === "birth" ? new Date(r.birth).toLocaleDateString("ru-RU") : r[key];
  const lines = rows.map((r) => [r.id, ...cols.map((c) => mapVal(r, c.key))].map(esc).join(","));
  return [header, ...lines].join("\n");
}
function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Registry() {
  // zustand
  const query = usePeople((s) => s.query);
  const setQuery = usePeople((s) => s.setQuery);
  const select = usePeople((s) => s.select);
  const statusById = usePeople((s) => s.overrides?.statusById || {});
  const updateStatus = usePeople((s) => s.updateStatus);

  // debounced search
  const [q, setQ] = useState(query);
  useEffect(() => setQ(query), [query]);
  useEffect(() => { const t = setTimeout(() => setQuery(q), 300); return () => clearTimeout(t); }, [q, setQuery]);

  // filters (модалка)
  const [filters, setFilters] = useState({});

  // pane toggle (по умолчанию скрыт)
  const [paneOpen, setPaneOpen] = useState(false);

  // вид / таблица
  const [view, setView] = useState(() => localStorage.getItem(LS_VIEW) || "table");
  useEffect(() => localStorage.setItem(LS_VIEW, view), [view]);

  const [visibleKeys, setVisibleKeys] = useState(() => {
    const saved = localStorage.getItem(LS_COLS);
    return saved ? JSON.parse(saved) : ALL_COLS.map((c) => c.key);
  });
  const [density, setDensity] = useState(() => localStorage.getItem(LS_DENS) || "comfortable");
  useEffect(() => localStorage.setItem(LS_COLS, JSON.stringify(visibleKeys)), [visibleKeys]);
  useEffect(() => localStorage.setItem(LS_DENS, density), [density]);

  const rowHeight = density === "compact" ? 44 : density === "spacious" ? 60 : 52;
  const rowClass  = density === "compact" ? ""  : density === "spacious" ? "py-1" : "";

  const cols     = useMemo(() => ALL_COLS.filter((c) => visibleKeys.includes(c.key)), [visibleKeys]);
  const template = useMemo(() => cols.map((c) => c.width).join(" "), [cols]);
  const templateWithSel = useMemo(() => `40px ${template}`, [template]);

  const [sortSpec, setSortSpec] = useState(() => JSON.parse(localStorage.getItem(LS_SORT) || "[]"));
  useEffect(() => localStorage.setItem(LS_SORT, JSON.stringify(sortSpec)), [sortSpec]);
  const toggleSort = (key, withShift) => {
    setSortSpec((prev) => {
      let spec = prev.slice();
      const ix = spec.findIndex((s) => s.key === key);
      if (!withShift) spec = ix >= 0 ? [spec[ix]] : [];
      if (ix === -1) spec.push({ key, dir: "asc" });
      else if (spec[ix].dir === "asc") spec[ix] = { key, dir: "desc" };
      else spec.splice(ix, 1);
      return spec;
    });
  };

  const BASE_FIELDS = ["fio", "birth", "gender", "city", "email", "status", "phone"];
  const selectFields = useMemo(
    () => Array.from(new Set(["id", ...BASE_FIELDS, ...cols.map((c) => c.key)])),
    [cols]
  );

  // загрузка данных
  const limit = 100;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["people", { q, sortSpec, selectFields, view, filters }],
    queryFn: ({ pageParam = "0", signal }) =>
      fetchPeople({ cursor: pageParam, limit, q, sort: sortSpec, select: selectFields, filters, signal }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 15_000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    gcTime: 5 * 60 * 1000,
  });

  const rowsRaw = useMemo(() => (data?.pages.flatMap((p) => p.items)) ?? [], [data]);
  const rows = useMemo(
    () => rowsRaw.map((r) => (statusById[r.id] ? { ...r, status: statusById[r.id] } : r)),
    [rowsRaw, statusById]
  );
  const total = data?.pages?.[0]?.total ?? rows.length;

  // выбор / выделение
  const [previewId, setPreviewId] = useState(null); // прежний превью не нужен, но оставлю для dblclick
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [anchorId, setAnchorId] = useState(null);
  const clearSelection = () => setSelectedIds(new Set());

  const onToggleSelect = (id, { range = false, ctrl = false } = {}) => {
    if (range) {
      if (anchorId == null) { setSelectedIds(new Set([id])); return; }
      const a = rows.findIndex((r) => r.id === anchorId);
      const b = rows.findIndex((r) => r.id === id);
      if (a < 0 || b < 0) return;
      const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
      const rangeIds = rows.slice(lo, hi + 1).map((r) => r.id);
      setSelectedIds((prev) => {
        if (ctrl) { const next = new Set(prev); rangeIds.forEach((x) => next.add(x)); return next; }
        return new Set(rangeIds);
      });
      return;
    }
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const masterRef = useRef(null);
  const allOnPage  = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someOnPage = selectedIds.size > 0 && !allOnPage;
  useEffect(() => { if (masterRef.current) masterRef.current.indeterminate = someOnPage; }, [someOnPage]);
  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPage) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  // массовые действия
  const bulkSetStatus = (newStatus) => {
    if (!newStatus || selectedIds.size === 0) return;
    selectedIds.forEach((id) => updateStatus(id, newStatus));
  };
  const bulkExportCSV = () => {
    const selectedRows = rows.filter((r) => selectedIds.has(r.id));
    const dataToExport = selectedRows.length ? selectedRows : rows;
    const csv = rowsToCSV(dataToExport, cols);
    downloadCSV(`people_${selectedRows.length || rows.length}.csv`, csv);
  };

  // представления
  const snapshot = { query: q, filters, visibleKeys, density, view, sortSpec };
  const applySnapshot = (v) => {
    if (typeof v.query === "string") { setQ(v.query); setQuery(v.query); }
    if (v.filters) setFilters(v.filters);
    if (Array.isArray(v.visibleKeys)) setVisibleKeys(v.visibleKeys);
    if (v.density) setDensity(v.density);
    if (v.view) setView(v.view);
    if (Array.isArray(v.sortSpec)) setSortSpec(v.sortSpec);
  };

  // UX
  const firstPrefetchedRef = useRef(false);
  useEffect(() => {
    if (!firstPrefetchedRef.current && data?.pages?.length === 1 && hasNextPage) {
      firstPrefetchedRef.current = true;
      fetchNextPage();
    }
  }, [data?.pages?.length, hasNextPage, fetchNextPage]);

  const scrollRootRef = useRef(null);
  useEffect(() => {
    setSelectedIds(new Set());
    setAnchorId(null);
    setPreviewId(null);
    if (scrollRootRef.current) scrollRootRef.current.scrollTop = 0;
  }, [q, JSON.stringify(filters), view, JSON.stringify(sortSpec)]);

  function LoaderRow({ style }) {
    const ref = useRef(null);
    useEffect(() => {
      if (!hasNextPage) return;
      const el = ref.current;
      const root = scrollRootRef.current;
      if (!el || !root) return;
      let busy = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !busy) {
            busy = true;
            fetchNextPage().finally(() => { busy = false; });
          }
        },
        { root, rootMargin: "120px" }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [hasNextPage, fetchNextPage]);

    return (
      <div ref={ref} style={style} className="flex items-center justify-center text-eco-mute text-sm" aria-busy={isFetchingNextPage}>
        {isFetchingNextPage ? "Загрузка…" : hasNextPage ? "Прокрутите ниже" : "Готово"}
      </div>
    );
  }
  function RowOrLoader(props) {
    const { index, style } = props;
    if (index < rows.length) {
      return (
        <Row
          index={index}
          style={style}
          rows={rows}
          cols={cols}
          template={templateWithSel}
          rowClass={rowClass}
          onPreview={(id) => { setPreviewId(id); select(id); setPaneOpen(true); }}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          setAnchorId={setAnchorId}
        />
      );
    }
    return <LoaderRow style={style} />;
  }

  const rowCount = rows.length + (hasNextPage ? 1 : 0);
  const showTableSkeleton = view === "table" && isLoading && rows.length === 0;
  const showCardsSkeleton = view === "cards" && isLoading && rows.length === 0;

  const ACTION_BAR_H = 48;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* toolbar + кнопка показать/скрыть панель */}
      <div className="col-span-12">
        <Card>
          <div className="flex items-center gap-2">
            <button
              className={`h-10 w-10 rounded-lg border ${paneOpen ? "bg-eco-green/20 border-eco-border" : "bg-white border-eco-border"}`}
              onClick={() => setPaneOpen((v) => !v)}
              title={paneOpen ? "Скрыть панель" : "Показать панель"}
            >
              {/* простая иконка «панель справа» */}
              <svg width="20" height="20" viewBox="0 0 24 24" className="mx-auto">
                <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor"/>
                <line x1="15" y1="4" x2="15" y2="20" stroke="currentColor"/>
              </svg>
            </button>

            <div className="flex-1">
              <TableToolbar
                q={q} setQ={setQ}
                total={total}
                view={view} setView={setView}
                visibleKeys={visibleKeys} setVisibleKeys={setVisibleKeys}
                density={density} setDensity={setDensity}
                sortSpec={sortSpec} setSortSpec={setSortSpec}
                snapshot={snapshot} applySnapshot={applySnapshot}
                filters={filters} setFilters={setFilters}
              />
            </div>
          </div>

          {/* «полка» под массовые действия */}
          <div style={{ height: ACTION_BAR_H }} className="mt-3">
            <div className={`flex flex-wrap items-center gap-2 h-12 transition-opacity
                             ${selectedIds.size ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
              <span className="text-sm text-eco-mute">
                Выбрано: {selectedIds.size.toLocaleString("ru-RU")}
              </span>
              <button className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm" onClick={bulkExportCSV}>
                Экспорт CSV
              </button>
              <select
                className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm"
                defaultValue=""
                onChange={(e) => { const v = e.target.value; if (v) { bulkSetStatus(v); e.target.value = ""; } }}
              >
                <option value="" disabled>Сменить статус…</option>
                <option value="активен">Сделать активными</option>
                <option value="на паузе">Перевести на паузу</option>
                <option value="архив">В архив</option>
              </select>
              <button className="h-10 px-3 rounded-xl border border-eco-border bg-white text-sm" onClick={clearSelection}>
                Снять выделение
              </button>
              {error && (
                <button className="h-10 px-3 rounded-xl border border-red-300 bg-white text-sm text-red-600" onClick={() => refetch()}>
                  Повторить загрузку
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* список */}
      <div className={paneOpen ? "col-span-7" : "col-span-12"}>
        <Card className="p-0">
          {view === "table" ? (
            showTableSkeleton ? (
              <TableSkeletonInline template={templateWithSel} rowHeight={rowHeight} rows={10} />
            ) : (
              <>
                <div className="grid px-3 py-2 text-sm bg-eco-bg text-eco-mute border-b border-eco-border sticky top-0 z-10" style={{ gridTemplateColumns: templateWithSel }}>
                  <div className="flex items-center justify-center">
                    <input
                      ref={masterRef}
                      type="checkbox"
                      checked={allOnPage}
                      onChange={toggleAllOnPage}
                      title={allOnPage ? "Снять выделение" : "Выбрать всё на странице"}
                    />
                  </div>
                  {cols.map((c) => {
                    const s = sortSpec.find((s) => s.key === c.key);
                    const icon = !s ? "" : s.dir === "asc" ? "↑" : "↓";
                    return (
                      <button
                        key={c.key}
                        onClick={(e) => toggleSort(c.key, e.shiftKey)}
                        className="text-left truncate hover:underline decoration-dotted"
                        title={s ? `Сортировка: ${s.dir}` : "Сортировать"}
                      >
                        {c.label}{icon ? ` ${icon}` : ""}
                      </button>
                    );
                  })}
                </div>

                <div style={{ height: 520, width: "100%" }} className="overflow-x-hidden" ref={scrollRootRef}>
                  <List
                    className="w-full"
                    rowCount={rowCount}
                    rowHeight={rowHeight}
                    rowComponent={RowOrLoader}
                    rowProps={{}}
                    overscanCount={4}
                  />
                </div>
              </>
            )
          ) : (
            showCardsSkeleton ? (
              <CardsGridSkeletonInline count={12} />
            ) : (
              <CardsGrid
                items={rows}
                onSelect={(id) => { select(id); setPaneOpen(true); }}
                onPreview={(id) => { select(id); setPaneOpen(true); }}
              />
            )
          )}
        </Card>
      </div>

      <RightPane open={paneOpen} onClose={() => setPaneOpen(false)} />
    </div>
  );
}
