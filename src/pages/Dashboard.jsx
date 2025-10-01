import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import SectionCard from "../components/ui/SectionCard";
import { fetchPeople } from "../services/peopleApi";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList,
  ReferenceLine,
  Brush,
  Label,
} from "recharts";

/* ===== Палитра ===== */
const C = {
  red: "#EF4444",
  green: "#22C55E",
  teal: "#14B8A6",
  blue: "#3B82F6",
  indigo: "#6366F1",
  violet: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#FB7185",
  slate: "#94A3B8",
};

/* ===== Утилиты ===== */
const ageFromBirth = (iso) => {
  if (!iso) return null;
  const b = new Date(iso);
  if (isNaN(+b)) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
};
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
const round1 = (n) => Math.round(n * 10) / 10;

/* ===== Мини-компоненты (KPI) ===== */
function TrendBadge({ value }) {
  const pos = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-[2px] rounded-full ${
        pos ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0">
        {pos ? (
          <path d="M12 4l4 6h-3v10h-2V10H8l4-6z" fill="currentColor" />
        ) : (
          <path d="M12 20l-4-6h3V4h2v10h3l-4 6z" fill="currentColor" />
        )}
      </svg>
      {pos ? "+" : ""}
      {round1(value)}%
    </span>
  );
}
function TinyTooltip({ active, payload }) {
  if (active && payload?.length) {
    return (
      <div className="px-2 py-1 text-xs rounded-lg bg-black/80 text-white">
        {payload[0].value}
      </div>
    );
  }
  return null;
}
function StatCard({ title, value, hint, color = C.blue, data = [] }) {
  return (
    <div
      className="rounded-2xl p-4 text-white shadow-sm"
      style={{ background: color, boxShadow: "0 10px 24px rgba(0,0,0,.08)" }}
    >
      <div className="flex items-start justify-between">
        <div className="text-[13px] opacity-90">{title}</div>
        {typeof hint === "number" && <TrendBadge value={hint} />}
      </div>
      <div className="mt-1 text-[24px] font-semibold leading-none">{value}</div>
      <div className="h-10 mt-2 opacity-90">
        <ResponsiveContainer>
          <LineChart data={data}>
            <Tooltip content={<TinyTooltip />} />
            <Line type="monotone" dataKey="y" stroke="#fff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function SmallLegendPill({ color, label, value, sub }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-sm">
        <span className="font-medium">{label}</span>{" "}
        <span className="text-eco-mute">— {value}{sub ? ` ${sub}` : ""}</span>
      </span>
    </div>
  );
}

/* ===== Модалка фильтров ===== */
function FilterModal({
  open,
  onClose,
  allCities,
  allDomains,
  initial = {
    q: "",
    status: "all",
    cities: [],
    ageFrom: "",
    ageTo: "",
    needEmail: null,
    needPhone: null,
    genders: [],
    emailDomains: [],
    birthMonths: [],
    birthYears: [],
  },
  onApply,
}) {
  const [q, setQ] = useState(initial.q);
  const [status, setStatus] = useState(initial.status);
  const [cities, setCities] = useState(initial.cities);
  const [ageFrom, setAgeFrom] = useState(initial.ageFrom);
  const [ageTo, setAgeTo] = useState(initial.ageTo);
  const [needEmail, setNeedEmail] = useState(initial.needEmail);
  const [needPhone, setNeedPhone] = useState(initial.needPhone);
  const [genders, setGenders] = useState(initial.genders);
  const [emailDomains, setEmailDomains] = useState(initial.emailDomains);
  const [birthMonths, setBirthMonths] = useState(initial.birthMonths);
  const [birthYears, setBirthYears] = useState(initial.birthYears);

  useEffect(() => {
    if (open) {
      setQ(initial.q);
      setStatus(initial.status);
      setCities(initial.cities);
      setAgeFrom(initial.ageFrom);
      setAgeTo(initial.ageTo);
      setNeedEmail(initial.needEmail);
      setNeedPhone(initial.needPhone);
      setGenders(initial.genders);
      setEmailDomains(initial.emailDomains);
      setBirthMonths(initial.birthMonths);
      setBirthYears(initial.birthYears);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleIn = (arr, value, set) =>
    set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  const reset = () => {
    setQ("");
    setStatus("all");
    setCities([]);
    setAgeFrom("");
    setAgeTo("");
    setNeedEmail(null);
    setNeedPhone(null);
    setGenders([]);
    setEmailDomains([]);
    setBirthMonths([]);
    setBirthYears([]);
  };
  const apply = () =>
    onApply({
      q,
      status,
      cities,
      ageFrom,
      ageTo,
      needEmail,
      needPhone,
      genders,
      emailDomains,
      birthMonths,
      birthYears,
    });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-12 -translate-x-1/2 w-[min(980px,92vw)]">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">Фильтры</div>
              <div className="text-eco-mute text-sm">Уточните подборку и примените</div>
            </div>
            <button className="h-9 px-3 rounded-lg border border-eco-border" onClick={onClose}>
              Закрыть
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="block">
              <span className="block text-[13px] text-eco-mute">Быстрый поиск</span>
              <input
                className="mt-1 w-full h-10 px-3 rounded-lg border border-eco-border text-[14px]"
                placeholder="ФИО / город / email / часть телефона"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="block text-[13px] text-eco-mute">Статус</span>
              <select
                className="mt-1 w-full h-10 px-3 rounded-lg border border-eco-border text-[14px]"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Все</option>
                <option>активен</option>
                <option>на паузе</option>
                <option>архив</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="block text-[13px] text-eco-mute">Города (multi)</span>
              <select
                multiple
                size={8}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-eco-border text-[14px]"
                value={cities}
                onChange={(e) => setCities(Array.from(e.target.selectedOptions, (o) => o.value))}
              >
                {allCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[13px] text-eco-mute">Возраст от</span>
                <input
                  type="number"
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-eco-border text-[14px]"
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-[13px] text-eco-mute">до</span>
                <input
                  type="number"
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-eco-border text-[14px]"
                  value={ageTo}
                  onChange={(e) => setAgeTo(e.target.value)}
                />
              </label>

              <label className="inline-flex items-center gap-2 text-[14px] mt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={needEmail === true}
                  onChange={() => setNeedEmail(needEmail === true ? null : true)}
                />
                есть email
              </label>
              <label className="inline-flex items-center gap-2 text-[14px] mt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={needPhone === true}
                  onChange={() => setNeedPhone(needPhone === true ? null : true)}
                />
                есть телефон
              </label>
            </div>

            {/* Пол */}
            <div className="space-y-2">
              <div className="text-[13px] text-eco-mute">Пол</div>
              <div className="flex gap-2">
                {["муж", "жен"].map((g) => (
                  <button
                    key={g}
                    className={`h-8 px-3 rounded-full border ${
                      genders.includes(g) ? "bg-eco-blue text-white border-eco-blue" : "bg-white"
                    }`}
                    onClick={() =>
                      setGenders(genders.includes(g) ? genders.filter((x) => x !== g) : [...genders, g])
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Домены email */}
            <label className="block">
              <span className="block text-[13px] text-eco-mute">Домены email (multi)</span>
              <select
                multiple
                size={6}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-eco-border text-[14px]"
                value={emailDomains}
                onChange={(e) =>
                  setEmailDomains(Array.from(e.target.selectedOptions, (o) => o.value))
                }
              >
                {allDomains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            {/* Месяцы рождения */}
            <div className="space-y-2 md:col-span-2">
              <div className="text-[13px] text-eco-mute">Месяц рождения</div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    className={`h-8 w-10 rounded-lg border ${
                      birthMonths.includes(m) ? "bg-eco-green border-eco-green text-white" : "bg-white"
                    }`}
                    onClick={() =>
                      setBirthMonths(
                        birthMonths.includes(m) ? birthMonths.filter((x) => x !== m) : [...birthMonths, m]
                      )
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Годы рождения (подсказка) */}
            {birthYears.length > 0 && (
              <div className="md:col-span-2 text-[13px] text-eco-mute">
                Активные годы: {birthYears.join(", ")}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button className="h-9 px-3 rounded-lg border border-eco-border" onClick={reset}>
              Сбросить
            </button>
            <button className="h-9 px-3 rounded-lg bg-eco-blue text-white" onClick={apply}>
              Применить
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ===== Главный компонент ===== */
export default function Dashboard() {
  const navigate = useNavigate();

  /* --- загрузка базы --- */
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      try {
        const { items } = await fetchPeople({
          cursor: "0",
          limit: 100000,
          select: ["id", "fio", "gender", "birth", "city", "email", "phone", "status"],
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setRows(items);
      } catch (e) {
        if (e?.name !== "AbortError" && !controller.signal.aborted) {
          console.error(e);
          setError("Не удалось загрузить статистику");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  /* --- справочники --- */
  const allCities = useMemo(() => {
    const m = new Map();
    for (const r of rows) m.set(r.city, (m.get(r.city) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [rows]);

  const allDomains = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const d = r.email?.split("@")[1]?.toLowerCase();
      if (d) m.set(d, (m.get(d) || 0) + 1);
    }
    return [...m.keys()].sort();
  }, [rows]);

  /* --- toolbar/filters --- */
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [flt, setFlt] = useState({
    q: "",
    status: "all",
    cities: [],
    ageFrom: "",
    ageTo: "",
    needEmail: null,
    needPhone: null,
    genders: [],
    emailDomains: [],
    birthMonths: [],
    birthYears: [],
  });

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (flt.q.trim()) n++;
    if (flt.status !== "all") n++;
    if (flt.cities.length) n++;
    if (flt.ageFrom !== "" || flt.ageTo !== "") n++;
    if (flt.needEmail != null) n++;
    if (flt.needPhone != null) n++;
    if (flt.genders.length) n++;
    if (flt.emailDomains.length) n++;
    if (flt.birthMonths.length) n++;
    if (flt.birthYears.length) n++;
    return n;
  }, [flt]);

  /* --- фильтрация строк --- */
  const rowsFiltered = useMemo(() => {
    const s = String(q || flt.q).trim().toLowerCase();
    const onlyDigits = s.replace(/\D+/g, "");
    const hasPhoneNeedle = onlyDigits.length >= 5;

    return rows.filter((r) => {
      if (s) {
        const hay = (r.fio + " " + r.city + " " + (r.email || "")).toLowerCase();
        const okText =
          hay.includes(s) ||
          (hasPhoneNeedle && String(r.phone || "").replace(/\D+/g, "").includes(onlyDigits));
        if (!okText) return false;
      }
      if (flt.status !== "all" && r.status !== flt.status) return false;
      if (flt.cities.length && !flt.cities.includes(r.city)) return false;
      if (flt.genders.length && !flt.genders.includes(r.gender)) return false;

      if (flt.needEmail != null) {
        const ok = flt.needEmail ? !!r.email : !r.email;
        if (!ok) return false;
      }
      if (flt.needPhone != null) {
        const ok = flt.needPhone ? !!r.phone : !r.phone;
        if (!ok) return false;
      }

      if (flt.emailDomains.length) {
        const d = r.email?.split("@")[1]?.toLowerCase();
        if (!d || !flt.emailDomains.includes(d)) return false;
      }

      const a = ageFromBirth(r.birth);
      if (flt.ageFrom !== "" && (a == null || a < Number(flt.ageFrom))) return false;
      if (flt.ageTo !== "" && (a == null || a > Number(flt.ageTo))) return false;

      if (flt.birthMonths.length) {
        const m = new Date(r.birth).getMonth() + 1;
        if (!flt.birthMonths.includes(m)) return false;
      }
      if (flt.birthYears.length) {
        const y = new Date(r.birth).getFullYear();
        if (!flt.birthYears.includes(y)) return false;
      }

      return true;
    });
  }, [rows, q, flt]);

  /* --- агрегаты --- */
  const stats = useMemo(() => {
    const total = rowsFiltered.length;
    const withEmail = rowsFiltered.filter((r) => !!r.email).length;
    const withPhone = rowsFiltered.filter((r) => !!r.phone).length;

    const byGender = { муж: 0, жен: 0 };
    const byStatus = {};
    const byCity = new Map();
    const byAgeBin = new Map();
    const byBirthYear = new Map();
    const byDomain = new Map();
    const byBirthMonth = new Map();

    let ageSum = 0,
      ageCnt = 0;
    for (const r of rowsFiltered) {
      if (r.gender === "муж") byGender.муж++;
      else if (r.gender === "жен") byGender.жен++;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byCity.set(r.city, (byCity.get(r.city) || 0) + 1);

      const a = ageFromBirth(r.birth);
      if (a != null) {
        ageSum += a;
        ageCnt++;
        const bin = `${Math.floor(a / 10) * 10}–${Math.floor(a / 10) * 10 + 9}`;
        byAgeBin.set(bin, (byAgeBin.get(bin) || 0) + 1);
        const y = new Date(r.birth).getFullYear();
        byBirthYear.set(y, (byBirthYear.get(y) || 0) + 1);
        const m = new Date(r.birth).getMonth() + 1;
        byBirthMonth.set(m, (byBirthMonth.get(m) || 0) + 1);
      }
      if (r.email) {
        const d = r.email.split("@")[1]?.toLowerCase() || "";
        if (d) byDomain.set(d, (byDomain.get(d) || 0) + 1);
      }
    }

    const avgAge = ageCnt ? Math.round(ageSum / ageCnt) : 0;
    const genderPie = [
      { name: "Мужчины", value: byGender.муж, key: "муж" },
      { name: "Женщины", value: byGender.жен, key: "жен" },
    ];
    const statusBar = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const topCities = [...byCity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value, pct: pct(value, total) }));
    const ageDist = [...byAgeBin.entries()]
      .sort((a, b) => Number(a[0].split("–")[0]) - Number(b[0].split("–")[0]))
      .map(([name, value]) => ({ name, value, pct: pct(value, total) }));
    const years = [...byBirthYear.keys()].sort((a, b) => a - b);
    const yearTrend = years.map((y) => ({ year: y, count: byBirthYear.get(y) }));
    const months = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
      m,
      count: byBirthMonth.get(m) || 0,
    }));
    const domains = [...byDomain.entries()].sort((a, b) => b[1] - a[1]);
    const topDomains = (() => {
      const top = domains.slice(0, 5).map(([name, value]) => ({ name, value }));
      if (domains.length > 5) {
        const rest = domains.slice(5).reduce((s, [, v]) => s + v, 0);
        top.push({ name: "прочие", value: rest, isOther: true });
      }
      return top;
    })();

    const mkSpark = (seed, base) =>
      Array.from({ length: 12 }, (_, i) => ({
        x: i + 1,
        y: Math.round(base * (0.8 + ((i * 37 + seed * 13) % 17) / 100)),
      }));

    const medianAge = (() => {
      const arr = [];
      for (const r of rowsFiltered) {
        const a = ageFromBirth(r.birth);
        if (a != null) arr.push(a);
      }
      if (!arr.length) return null;
      arr.sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
    })();

    return {
      total,
      avgAge,
      medianAge,
      withEmail,
      withPhone,
      genderPie,
      statusBar,
      topCities,
      ageDist,
      yearTrend,
      topDomains,
      months,
      emailPct: pct(withEmail, total),
      phonePct: pct(withPhone, total),
      sparkTotal: mkSpark(1, Math.max(50, Math.floor(total / 1200))),
      sparkEmail: mkSpark(2, Math.max(20, Math.floor(withEmail / 1200))),
      sparkPhone: mkSpark(3, Math.max(20, Math.floor(withPhone / 1200))),
      sparkAge: mkSpark(4, Math.max(30, Math.floor(avgAge))),
    };
  }, [rowsFiltered]);

  /* --- переход в реестр (нужен только для клика по "Мужчины") --- */
  const buildQuery = (filters) => {
    const p = new URLSearchParams();
    if (filters.q?.trim()) p.set("q", filters.q.trim());
    if (filters.status && filters.status !== "all") p.set("status", filters.status);
    if (filters.cities?.length) p.set("cities", filters.cities.join(","));
    if (filters.genders?.length) p.set("genders", filters.genders.join(","));
    if (filters.emailDomains?.length) p.set("domains", filters.emailDomains.join(","));
    if (filters.birthMonths?.length) p.set("months", filters.birthMonths.join(","));
    if (filters.birthYears?.length) p.set("years", filters.birthYears.join(","));
    if (filters.ageFrom !== "") p.set("ageFrom", String(filters.ageFrom));
    if (filters.ageTo !== "") p.set("ageTo", String(filters.ageTo));
    if (filters.needEmail != null) p.set("needEmail", filters.needEmail ? "1" : "0");
    if (filters.needPhone != null) p.set("needPhone", filters.needPhone ? "1" : "0");
    return p.toString();
  };

  const goToRegistry = (patch = {}) => {
    const next = { ...flt, q, ...patch };
    setFlt(next);
    const qs = buildQuery(next);
    navigate(`/registry?${qs}`, { state: { presetFilters: next, from: "dashboard" } });
  };

  /* --- загрузка/ошибка --- */
  if (loading) {
    return (
      <Card className="px-6 py-5">
        <div className="animate-pulse text-eco-mute">Загружаем дашборд…</div>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="px-6 py-5">
        <div className="text-red-600">{error}</div>
      </Card>
    );
  }

  const now = new Date().toLocaleString("ru-RU");

  /* =================== РЕНДЕР =================== */
  return (
    <div className="mx-auto px-6 space-y-6 xl:max-w-[1440px] 2xl:max-w-[1760px]">
      
      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <input
            className="flex-1 h-10 px-3 rounded-lg border border-eco-border text-[15px]"
            placeholder="Поиск по ФИО, городу, email или части номера телефона"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="relative h-10 px-3 rounded-lg border border-eco-border text-[14px] bg-white"
            onClick={() => setFiltersOpen(true)}
            title="Открыть фильтры"
          >
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 rounded-full bg-eco-blue text-white text-xs grid place-items-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Всего записей" value={stats.total.toLocaleString("ru-RU")} hint={+3.6} color={C.blue} data={stats.sparkTotal} />
        <StatCard title="Средний возраст" value={`${stats.avgAge} лет`} hint={-1.2} color={C.green} data={stats.sparkAge} />
        <StatCard title="Есть email" value={`${stats.emailPct}%`} hint={+2.1} color={C.indigo} data={stats.sparkEmail} />
        <StatCard title="Есть телефон" value={`${stats.phonePct}%`} hint={+0.8} color={C.violet} data={stats.sparkPhone} />
      </div>

      {/* Ряд 1 */}
      <div className="grid lg:grid-cols-3 gap-3">
        <SectionCard title="Гендерное распределение" subtitle="Клик по «Мужчины» → список (женщины не кликаются)">
          <div className="px-2">
            <div className="flex gap-6 mb-2">
              <SmallLegendPill color={C.teal} label="Мужчины" value={`${pct(stats.genderPie[0].value, stats.total)}%`} />
              <SmallLegendPill color={C.indigo} label="Женщины" value={`${pct(stats.genderPie[1].value, stats.total)}%`} />
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.genderPie}
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {/* Мужчины — кликабельно */}
                    <Cell
                      fill={C.teal}
                      cursor={stats.genderPie[0].value > 0 ? "pointer" : "default"}
                      onClick={() => {
                        if (stats.genderPie[0].value > 0) goToRegistry({ genders: ["муж"] });
                      }}
                    />
                    {/* Женщины — НЕ кликабельно */}
                    <Cell fill={C.indigo} cursor="default" />
                    <LabelList position="outside" formatter={(v) => `${pct(v, stats.total)}%`} />
                    <Label
                      content={(props) => {
                        const vb = props && props.viewBox;
                        if (!vb || vb.cx == null || vb.cy == null) return null;
                        return (
                          <text
                            x={vb.cx}
                            y={vb.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: 14, fontWeight: 600, fill: "#334155" }}
                          >
                            Пол
                          </text>
                        );
                      }}
                    />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Статусы" subtitle="Распределение по статусам">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart
                data={stats.statusBar}
                // добавили верхний отступ, чтобы влезли подписи
                margin={{ top: 28, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                {/* добавили запас по оси Y (≈ +12%) */}
                <YAxis
                  allowDecimals={false}
                  domain={[0, (dataMax) => Math.ceil(dataMax * 1.12)]}
                />
                <Tooltip formatter={(v) => [v, "Кол-во"]} />
                <Bar dataKey="value" fill={C.blue} radius={[8, 8, 0, 0]}>
                  {/* сдвинули подписи чуть выше столбца */}
                  <LabelList dataKey="value" position="top" offset={8} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>


        <SectionCard title="Топ городов" subtitle="10 крупнейших по числу записей">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats.topCities} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip formatter={(v, _, p) => [`${v} (${p.payload.pct}%)`, `Записей`]} />
                <Bar dataKey="value" fill={C.green} radius={[0, 8, 8, 0]}>
                  <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Ряд 2 */}
      <div className="grid lg:grid-cols-2 gap-3">
        <SectionCard title="Возрастные корзины" subtitle="Доли по десятилетиям">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={stats.ageDist}>
                <defs>
                  <linearGradient id="gAge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v, _, p) => [`${v} (${p.payload.pct}%)`, "Записей"]} />
                {stats.medianAge && (
                  <ReferenceLine
                    x={`${Math.floor(stats.medianAge / 10) * 10}–${Math.floor(stats.medianAge / 10) * 10 + 9}`}
                    stroke={C.rose}
                    strokeDasharray="4 4"
                    label={{ value: `Медиана ${stats.medianAge}`, position: "insideTop", fill: C.rose }}
                  />
                )}
                <Area type="monotone" dataKey="value" stroke={C.teal} fill="url(#gAge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Годы рождения" subtitle="Распределение по годам (Brush-зум)">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={stats.yearTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={C.indigo} strokeWidth={2} dot={false} />
                <Brush height={20} travellerWidth={8} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Ряд 3 */}
      <div className="grid lg:grid-cols-2 gap-3">
        <SectionCard title="Домены email" subtitle="Топ провайдеров">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats.topDomains}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.topDomains.map((rec, idx) => (
                    <Cell key={`dom-${rec.name}-${idx}`} fill={rec.isOther ? C.slate : C.amber} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ pointerEvents: "none" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Рождения по месяцам" subtitle="Сезонность (1–12)">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={stats.months}>
                <defs>
                  <linearGradient id="gMon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.violet} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={C.violet} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={C.violet} fill="url(#gMon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Чипы активных фильтров */}
      {activeFiltersCount > 0 && (
        <Card className="p-3">
          <div className="text-sm text-eco-mute mb-2">Активные фильтры:</div>
          <div className="flex flex-wrap gap-2">
            {flt.q.trim() !== "" && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, q: "" }))}>
                Поиск: {flt.q} ×
              </button>
            )}
            {flt.status !== "all" && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, status: "all" }))}>
                Статус: {flt.status} ×
              </button>
            )}
            {flt.cities.map((c) => (
              <button key={c} className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, cities: s.cities.filter((x) => x !== c) }))}>
                {c} ×
              </button>
            ))}
            {flt.genders.map((g) => (
              <button key={g} className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, genders: s.genders.filter((x) => x !== g) }))}>
                Пол: {g} ×
              </button>
            ))}
            {flt.emailDomains.map((d) => (
              <button key={d} className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, emailDomains: s.emailDomains.filter((x) => x !== d) }))}>
                @{d} ×
              </button>
            ))}
            {flt.birthMonths.map((m) => (
              <button key={m} className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, birthMonths: s.birthMonths.filter((x) => x !== m) }))}>
                Месяц: {m} ×
              </button>
            ))}
            {flt.birthYears.map((y) => (
              <button key={y} className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, birthYears: s.birthYears.filter((x) => x !== y) }))}>
                Год: {y} ×
              </button>
            ))}
            {flt.ageFrom !== "" && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, ageFrom: "" }))}>
                Возраст от: {flt.ageFrom} ×
              </button>
            )}
            {flt.ageTo !== "" && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, ageTo: "" }))}>
                до: {flt.ageTo} ×
              </button>
            )}
            {flt.needEmail != null && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, needEmail: null }))}>
                {flt.needEmail ? "только с email" : "без email"} ×
              </button>
            )}
            {flt.needPhone != null && (
              <button className="px-2 py-1 rounded-full bg-eco-bg text-sm" onClick={() => setFlt((s) => ({ ...s, needPhone: null }))}>
                {flt.needPhone ? "только с телефоном" : "без телефона"} ×
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Модалка фильтров */}
      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        allCities={allCities}
        allDomains={allDomains}
        initial={{ ...flt, q }}
        onApply={(next) => {
          setFlt(next);
          setQ(next.q || "");
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}
