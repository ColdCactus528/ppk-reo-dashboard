import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import { usePeople } from "../store/people";

const LS_PERSON_VIEW = "personFull.view.v1"; 

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const fmtDateShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
};
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const calcAge = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return `${a} лет`;
};

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
    } catch {}
  }
}

/* =========================================================
   Примитивы UI
========================================================= */
function Pill({ children, tone = "blue" }) {
  const tones = {
    green: "bg-eco-green/30 text-eco-text",
    yellow: "bg-eco-yellow/60 text-eco-text",
    blue: "bg-eco-blue/40 text-eco-text",
    gray: "bg-eco-bg text-eco-text",
    red: "bg-rose-100 text-eco-text",
  };
  return (
    <span className={`inline-flex items-center h-7 px-2.5 rounded-full text-xs whitespace-nowrap ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}
function StatusPill({ status }) {
  const tone = status === "активен" ? "green" : status === "на паузе" ? "yellow" : "gray";
  return <Pill tone={tone}>{status}</Pill>;
}

function FieldRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-2 items-start">
      <div className="text-xs text-eco-mute">{label}</div>
      <div className="text-[14px]">{children}</div>
    </div>
  );
}
function Field({ label, children, help, error, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs text-eco-mute">{label}</span>
      {children}
      {help && !error && <span className="text-[11px] text-eco-mute">{help}</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </label>
  );
}
function Section({ title, children, id }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <div className="flex items-start justify-between">
        <h3 className="text-[16px] font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </section>
  );
}
function Block({ title, count, actions, children }) {
  return (
    <div className="border border-eco-border rounded-xl bg-white">
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-eco-border bg-eco-bg rounded-t-xl">
        <div className="text-sm font-medium">
          {title} {typeof count === "number" ? <span className="text-eco-mute">({count})</span> : null}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function TableKit({
  cols = [],
  rows = [],
  preset = "medium", // narrow | medium | wide
  rowLimit = 5,
  empty = "Нет данных",
  maxHeight = 420,
}) {
  const [expanded, setExpanded] = useState(false);

  const presets = {
    narrow: { padX: 8, headPy: 8, cellPy: 8 },
    medium: { padX: 14, headPy: 11, cellPy: 11 },
    wide: { padX: 16, headPy: 13, cellPy: 13 },
  };
  const px = presets[preset] || presets.medium;

  if (!rows || rows.length === 0) return <div className="text-eco-mute text-sm">{empty}</div>;

  const shown = expanded ? rows : rows.slice(0, rowLimit);
  const rest = Math.max(0, rows.length - shown.length);

  const clampStyle = (n) =>
    n
      ? {
          display: "-webkit-box",
          WebkitLineClamp: n,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          whiteSpace: "normal",
        }
      : {};

  return (
    <div className="rounded-xl border border-eco-border overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight }}>
        <table className="w-full table-auto text-sm leading-[1.25]">
          <thead className="sticky top-0 z-[1] bg-eco-bg shadow-[0_1px_0_0_var(--tw-border-opacity,1)_#E6E9F2]">
            <tr className="text-eco-mute text-[12px] font-medium">
              {cols.map((c, i) => (
                <th
                  key={c.key || i}
                  className="text-left align-top"
                  style={{
                    paddingLeft: px.padX,
                    paddingRight: px.padX,
                    paddingTop: px.headPy,
                    paddingBottom: px.headPy,
                    width: c.width,
                    minWidth: c.minWidth,
                    maxWidth: c.maxWidth,
                    whiteSpace: c.nowrap ? "nowrap" : "normal",
                  }}
                  title={typeof c.label === "string" ? c.label : undefined}
                >
                  <div className="truncate">{c.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-eco-border">
            {shown.map((r, ri) => (
              <tr key={r.id ?? ri} className={ri % 2 ? "bg-eco-bg/30" : "bg-white"}>
                {cols.map((c, ci) => {
                  const raw = c.render ? c.render(r) : r[c.key];
                  const isEmpty = raw == null || raw === "";
                  const val =
                    isEmpty
                      ? "—"
                      : typeof raw === "number" && c.align === "right"
                      ? raw.toLocaleString("ru-RU")
                      : raw;

                  const align =
                    c.align === "right" ? "text-right"
                    : c.align === "center" ? "text-center"
                    : "text-left";

                  const nowrap = c.wrap === false || c.nowrap;
                  const wrapClass = nowrap
                    ? "whitespace-nowrap overflow-hidden text-ellipsis"
                    : "whitespace-normal break-words";

                  const tdStyle = {
                    paddingLeft: px.padX,
                    paddingRight: px.padX,
                    paddingTop: px.cellPy,
                    paddingBottom: px.cellPy,
                    fontVariantNumeric: c.align === "right" ? "tabular-nums" : undefined,
                    width: c.width,
                    minWidth: c.minWidth,
                    maxWidth: c.maxWidth,
                  };

                  return (
                    <td
                      key={c.key || ci}
                      className={`${align} align-top`}
                      style={tdStyle}
                      title={typeof raw === "string" ? raw : undefined}
                    >
                      <div className={wrapClass} style={clampStyle(c.clamp)}>
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {rest > 0 && (
        <div className="p-2 border-t border-eco-border bg-white">
          <button
            className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Свернуть" : `Показать ещё ${rest}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Навигация по секциям (режим "Разделы")
========================================================= */
function QuickNav({ sections, activeKey, onSelect }) {
  return (
    <nav className="hidden lg:block sticky top-16 self-start">
      <ul className="space-y-1">
        {sections.map((s) => (
          <li key={s.key}>
            <button
              onClick={() => onSelect(s.key)}
              className={`px-3 py-1.5 rounded-lg text-sm w-full text-left ${
                activeKey === s.key ? "bg-white border border-eco-border" : "text-eco-mute hover:bg-eco-bg"
              }`}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* =========================================================
   Основной компонент
========================================================= */
export default function PersonFullCard({
  person,
  onOpenRegistry, 
  onOpenMiniCard, 
}) {
  const updateStatus = usePeople((s) => s.updateStatus);

  const [view, setView] = useState(() => localStorage.getItem(LS_PERSON_VIEW) || "sections");
  useEffect(() => localStorage.setItem(LS_PERSON_VIEW, view), [view]);

  const [tab, setTab] = useState("profile");

  // Основное
  const [fio, setFio] = useState(person.fio || "");
  const [gender, setGender] = useState(person.gender || "муж");
  const [birth, setBirth] = useState((person.birth || "").slice(0, 10));
  const [status, setStatus] = useState(person.status || "активен");

  // Контакты
  const [email, setEmail] = useState(person.email || "");
  const [phone, setPhone] = useState(person.phone || "");
  const [tg, setTg] = useState(person.telegram || "");
  const [wa, setWa] = useState(person.whatsapp || "");
  const [viber, setViber] = useState(person.viber || "");
  const [skype, setSkype] = useState(person.skype || "");
  const [website, setWebsite] = useState(person.website || "");

  // Адреса
  const [regAddress, setRegAddress] = useState(person.regAddress || "");
  const [liveAddress, setLiveAddress] = useState("");

  // Работа / образование (локальные поля)
  const [org, setOrg] = useState("");
  const [position, setPosition] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Документы
  const [docs, setDocs] = useState(person.documents || []);
  const addDoc = () => setDocs((arr) => [...arr, { type: "паспорт", number: "", date: "", issuer: "", expires: "" }]);
  const updateDoc = (i, patch) => setDocs((arr) => arr.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeDoc = (i) => setDocs((arr) => arr.filter((_, idx) => idx !== i));

  // Семья
  const [family, setFamily] = useState(person.family || []);
  const addFamily = () => setFamily((arr) => [...arr, { fio: "", relation: "родство", birth: "", phone: "" }]);
  const updateFamily = (i, patch) => setFamily((arr) => arr.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeFamily = (i) => setFamily((arr) => arr.filter((_, idx) => idx !== i));

  // Согласия
  const [consents, setConsents] = useState(person.consents || []);

  // Мета (демо)
  const createdAt = useMemo(() => new Date().toLocaleString("ru-RU"), []);
  const updatedAt = useMemo(() => new Date().toLocaleString("ru-RU"), []);

  const changeStatus = (v) => {
    setStatus(v);
    updateStatus(person.id, v);
  };

  /* ---------------- Секции ---------------- */
  const sections = useMemo(() => {
    return [
      /* ===== Основные ===== */
      {
        key: "profile",
        title: "Основные данные",
        content: (
          <>
            <Block title="Паспортные данные">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="ФИО">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={fio}
                    onChange={(e) => setFio(e.target.value)}
                  />
                </Field>
                <Field label="Пол">
                  <select
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option>муж</option>
                    <option>жен</option>
                  </select>
                </Field>
                <Field label="Дата рождения">
                  <input
                    type="date"
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                  />
                </Field>
              </div>
            </Block>
          </>
        ),
      },

      /* ===== Контакты ===== */
      {
        key: "contacts",
        title: "Контакты",
        content: (
          <div className="grid md:grid-cols-2 gap-3">
            <Block
              title="Основные каналы"
              actions={
                <>
                  {phone && (
                    <button
                      className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs"
                      onClick={() => copyToClipboard(phone)}
                    >
                      Копировать телефон
                    </button>
                  )}
                  {email && (
                    <button
                      className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs"
                      onClick={() => copyToClipboard(email)}
                    >
                      Копировать email
                    </button>
                  )}
                </>
              }
            >
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Телефон">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Веб-сайт" className="md:col-span-2">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Field>
              </div>
            </Block>

            <Block title="Мессенджеры и соцсети">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Telegram">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    placeholder="@username"
                    value={tg}
                    onChange={(e) => setTg(e.target.value)}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    placeholder="+7..."
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                  />
                </Field>
                <Field label="Viber">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    placeholder="+7..."
                    value={viber}
                    onChange={(e) => setViber(e.target.value)}
                  />
                </Field>
                <Field label="Skype">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    placeholder="live:..."
                    value={skype}
                    onChange={(e) => setSkype(e.target.value)}
                  />
                </Field>
              </div>
            </Block>
          </div>
        ),
      },

      /* ===== Адреса ===== */
      {
        key: "addresses",
        title: "Адреса",
        content: (
          <Block title="Адреса проживания">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Адрес регистрации">
                <textarea
                  className="px-3 py-2 rounded-lg border border-eco-border"
                  rows={3}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                />
              </Field>
              <Field label="Фактический адрес">
                <textarea
                  className="px-3 py-2 rounded-lg border border-eco-border"
                  rows={3}
                  value={liveAddress}
                  onChange={(e) => setLiveAddress(e.target.value)}
                />
              </Field>
              <div>
                <button
                  className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm"
                  onClick={() => setLiveAddress(regAddress)}
                >
                  Скопировать из регистрации
                </button>
              </div>
            </div>
          </Block>
        ),
      },

      /* ===== Работа / Образование ===== */
      {
        key: "work_edu",
        title: "Работа / Образование",
        content: (
          // Левая карточка уже, правая шире
          <div className="grid md:[grid-template-columns:.45fr_1.55fr] xl:[grid-template-columns:.4fr_1.6fr] 2xl:[grid-template-columns:.35fr_1.65fr] gap-3">
            <Block title="Текущее">
              <div className="grid md:grid-cols-1 gap-3">
                <Field label="Организация">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                  />
                </Field>
                <Field label="Должность">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </Field>
                <Field label="Уровень образования">
                  <select
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="">—</option>
                    <option>Среднее</option>
                    <option>Среднее спец.</option>
                    <option>Высшее</option>
                    <option>Магистр</option>
                    <option>Кандидат наук</option>
                    <option>Доктор наук</option>
                  </select>
                </Field>
                <Field label="ВУЗ">
                  <input
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </Field>
                <Field label="Год окончания">
                  <input
                    type="number"
                    className="px-3 py-2 rounded-lg border border-eco-border"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  />
                </Field>
              </div>
            </Block>

            <Block title="История (из БД)">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-eco-mute mb-1">Работа</div>
                  <TableKit
                    preset="wide"
                    cols={[
                      { key: "org", label: "Организация", clamp: 1, minWidth: 220 },
                      { key: "position", label: "Должность", clamp: 1, minWidth: 160 },
                      { key: "department", label: "Отдел", clamp: 1, minWidth: 140 },
                      { key: "type", label: "Тип", width: 140, nowrap: true },
                      { key: "start", label: "С", width: 120, align: "left", nowrap: true, render: (r) => fmtDate(r.start) },
                      { key: "end", label: "По", width: 120, align: "left", nowrap: true, render: (r) => fmtDate(r.end) },
                      { 
                        key: "salary",
                        label: "Оклад",
                        width: 140,
                        align: "left",
                        nowrap: true,
                        render: (r) => (r.salary ? `${Number(r.salary).toLocaleString("ru-RU")} ₽` : "—"),
                      },
                    ]}
                    rows={person.jobs || []}
                  />
                </div>

                <div>
                  <div className="text-xs text-eco-mute mb-1">Образование</div>
                  <TableKit
                    preset="wide"
                    cols={[
                      { key: "university", label: "ВУЗ", clamp: 1, minWidth: 220 },
                      { key: "faculty", label: "Факультет", clamp: 1, minWidth: 180 },
                      { key: "specialty", label: "Специальность", clamp: 1, minWidth: 200 },
                      { key: "level", label: "Уровень", width: 160, nowrap: true },
                      { key: "gradYear", label: "Год", width: 100, align: "right", nowrap: true },
                      { key: "diploma", label: "Диплом", nowrap: true },
                    ]}
                    rows={person.educations || []}
                  />
                </div>
              </div>
            </Block>
          </div>
        ),
      },

      /* ===== Документы ===== */
      {
        key: "documents",
        title: "Документы",
        content: (
          <div className="grid gap-3">
            <Block
              title="Список документов"
              count={docs.length}
              actions={
                <button className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs" onClick={addDoc}>
                  Добавить документ
                </button>
              }
            >
              {docs.length === 0 ? (
                <div className="text-eco-mute text-sm">Документов пока нет.</div>
              ) : (
                docs.map((d, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="border border-eco-border rounded-xl p-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Тип">
                          <select
                            className="px-3 py-2 rounded-lg border border-eco-border"
                            value={d.type}
                            onChange={(e) => updateDoc(i, { type: e.target.value })}
                          >
                            <option>паспорт</option>
                            <option>загранпаспорт</option>
                            <option>вод. удостоверение</option>
                            <option>прочее</option>
                          </select>
                        </Field>
                        <Field label="Номер">
                          <input
                            className="px-3 py-2 rounded-lg border border-eco-border"
                            value={d.number}
                            onChange={(e) => updateDoc(i, { number: e.target.value })}
                          />
                        </Field>
                        <Field label="Дата выдачи">
                          <input
                            type="date"
                            className="px-3 py-2 rounded-lg border border-eco-border"
                            value={d.date || ""}
                            onChange={(e) => updateDoc(i, { date: e.target.value })}
                          />
                        </Field>
                        <Field label="Кем выдан">
                          <input
                            className="px-3 py-2 rounded-lg border border-eco-border"
                            value={d.issuer || ""}
                            onChange={(e) => updateDoc(i, { issuer: e.target.value })}
                          />
                        </Field>
                        <Field label="Срок действия">
                          <input
                            type="date"
                            className="px-3 py-2 rounded-lg border border-eco-border"
                            value={d.expires || ""}
                            onChange={(e) => updateDoc(i, { expires: e.target.value })}
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs"
                          onClick={() => removeDoc(i)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Block>
          </div>
        ),
      },

      /* ===== Семья ===== */
      {
        key: "family",
        title: "Семья",
        content: (
          <Block
            title="Члены семьи"
            count={family.length}
            actions={
              <button className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs" onClick={addFamily}>
                Добавить
              </button>
            }
          >
            {family.length === 0 ? (
              <div className="text-eco-mute text-sm">Список пуст.</div>
            ) : (
              <TableKit
                preset="wide"
                cols={[
                  { key: "fio", label: "ФИО", clamp: 1, minWidth: 220 },
                  { key: "relation", label: "Родство", width: 160, nowrap: true },
                  { key: "birth", label: "Дата рождения", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.birth) },
                  { key: "phone", label: "Телефон", width: 160, nowrap: true },
                ]}
                rows={family}
              />
            )}

            {family.map((m, i) => (
              <div key={"edit-" + i} className="mt-3 border border-eco-border rounded-xl p-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="ФИО">
                    <input
                      className="px-3 py-2 rounded-lg border border-eco-border"
                      value={m.fio}
                      onChange={(e) => updateFamily(i, { fio: e.target.value })}
                    />
                  </Field>
                  <Field label="Родство">
                    <select
                      className="px-3 py-2 rounded-lg border border-eco-border"
                      value={m.relation}
                      onChange={(e) => updateFamily(i, { relation: e.target.value })}
                    >
                      <option>родство</option>
                      <option>муж</option>
                      <option>жена</option>
                      <option>сын</option>
                      <option>дочь</option>
                      <option>отец</option>
                      <option>мать</option>
                      <option>другое</option>
                    </select>
                  </Field>
                  <Field label="Дата рождения">
                    <input
                      type="date"
                      className="px-3 py-2 rounded-lg border border-eco-border"
                      value={m.birth || ""}
                      onChange={(e) => updateFamily(i, { birth: e.target.value })}
                    />
                  </Field>
                  <Field label="Телефон">
                    <input
                      className="px-3 py-2 rounded-lg border border-eco-border"
                      value={m.phone || ""}
                      onChange={(e) => updateFamily(i, { phone: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    className="h-8 px-2 rounded-lg border border-eco-border bg-white text-xs"
                    onClick={() => removeFamily(i)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </Block>
        ),
      },

      /* ===== Согласия ===== */
      {
        key: "consents",
        title: "Согласия",
        content: (
          <Block title="Согласия на обработку">
            {Array.isArray(consents) && consents.length ? (
              <TableKit
                preset="medium"
                cols={[
                  { key: "type", label: "Тип", width: 220, clamp: 1 },
                  { key: "given", label: "Состояние", width: 140, render: (r) => (r.given ? "дано" : "нет") },
                  { key: "date", label: "Дата", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.date) },
                  { key: "revoked", label: "Отозвано", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.revoked) },
                ]}
                rows={consents}
              />
            ) : (
              <div className="text-eco-mute text-sm">Нет данных</div>
            )}
          </Block>
        ),
      },

      /* ===== Доп. профиль ===== */
      {
        key: "profile_extra",
        title: "Доп. профиль",
        content: (
          <Block title="Справочные поля">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Семейное положение">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.maritalStatus || ""}>
                  <option value="">—</option>
                  <option>не женат/не замужем</option>
                  <option>женат/замужем</option>
                  <option>в разводе</option>
                  <option>вдовец/вдова</option>
                </select>
              </Field>
              <Field label="Гражданство">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.citizenship || ""}>
                  <option value="">—</option>
                  <option>РФ</option>
                  <option>РФ/ЕС</option>
                  <option>иное</option>
                </select>
              </Field>
              <Field label="Национальность">
                <input className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.nationality || ""} />
              </Field>
              <Field label="Дети (кол-во)">
                <input type="number" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.hasChildren ?? 0} />
              </Field>
              <Field label="Статус занятости">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.employmentStatus || ""}>
                  <option value="">—</option>
                  <option>работает</option>
                  <option>самозанятый</option>
                  <option>безработный</option>
                  <option>студент</option>
                  <option>пенсионер</option>
                </select>
              </Field>
              <Field label="Уровень дохода">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.incomeLevel || ""}>
                  <option value="">—</option>
                  <option>низкий</option>
                  <option>средний</option>
                  <option>высокий</option>
                </select>
              </Field>
              <Field label="Предпочтительный канал связи">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.preferredContact || ""}>
                  <option value="">—</option>
                  <option>phone</option>
                  <option>email</option>
                  <option>telegram</option>
                  <option>whatsapp</option>
                </select>
              </Field>
              <Field label="Язык">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.preferredLanguage || ""}>
                  <option value="">—</option>
                  <option>ru</option>
                  <option>en</option>
                  <option>de</option>
                  <option>fr</option>
                  <option>es</option>
                  <option>zh</option>
                </select>
              </Field>
              <Field label="Время для звонка с">
                <input type="time" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.contactTimeFrom || ""} />
              </Field>
              <Field label="до">
                <input type="time" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.contactTimeTo || ""} />
              </Field>
              <Field label="Не беспокоить">
                <select className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.doNotDisturb ? "1" : "0"}>
                  <option value="0">нет</option>
                  <option value="1">да</option>
                </select>
              </Field>
              <Field label="Кредитный скор">
                <input type="number" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.creditScore ?? ""} />
              </Field>
            </div>
          </Block>
        ),
      },

      /* ===== Здоровье ===== */
      {
        key: "health",
        title: "Здоровье",
        content: (
          <Block title="Медицинские сведения" count={person.medicalRecords?.length || 0}>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <Field label="Группа инвалидности">
                <input type="number" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.disabilityGroup ?? 0} />
              </Field>
              <Field label="Группа крови">
                <input className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.bloodType || ""} />
              </Field>
              <Field label="Рост (см)">
                <input type="number" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.heightCm ?? ""} />
              </Field>
              <Field label="Вес (кг)">
                <input type="number" className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.weightKg ?? ""} />
              </Field>
              <Field label="Аллергии" className="md:col-span-2">
                <input
                  className="px-3 py-2 rounded-lg border border-eco-border"
                  defaultValue={Array.isArray(person.allergies) ? person.allergies.join(", ") : person.allergies || ""}
                />
              </Field>
            </div>

            <TableKit
              preset="medium"
              cols={[
                { key: "date", label: "Дата", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.date) },
                { key: "type", label: "Тип", width: 200, clamp: 1 },
                { key: "result", label: "Результат", clamp: 2 },
                { key: "doctor", label: "Врач", width: 180, clamp: 1 },
              ]}
              rows={person.medicalRecords || []}
            />
          </Block>
        ),
      },

      /* ===== Финансы и идентификаторы ===== */
      {
        key: "finance",
        title: "Финансы и идентификаторы",
        content: (
          <Block title="Идентификаторы и счета" count={person.bankAccounts?.length || 0}>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <Field label="ИНН">
                <input className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.inn || ""} />
              </Field>
              <Field label="СНИЛС">
                <input className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.snils || ""} />
              </Field>
              <Field label="Полис ОМС" className="md:col-span-2">
                <input className="px-3 py-2 rounded-lg border border-eco-border" defaultValue={person.omsPolicy || ""} />
              </Field>
            </div>

            <TableKit
              preset="wide"
              cols={[
                { key: "bank", label: "Банк", clamp: 1, minWidth: 200 },
                { key: "iban", label: "IBAN", nowrap: true },
                { key: "primary", label: "Основной", width: 140, render: (r) => (r.primary ? "да" : "нет") },
              ]}
              rows={person.bankAccounts || []}
            />
          </Block>
        ),
      },

      /* ===== История адресов ===== */
      {
        key: "addresses_history",
        title: "История адресов",
        content: (
          <Block title="Предыдущие адреса" count={person.addresses?.history?.length || 0}>
            <TableKit
              preset="wide"
              cols={[
                { key: "address", label: "Адрес", clamp: 2, minWidth: 320 },
                { key: "from", label: "С", width: 140, align: "left", nowrap: true, render: (r) => fmtDate(r.from) },
                { key: "to", label: "По", width: 140, align: "left", nowrap: true, render: (r) => fmtDate(r.to) },
              ]}
              rows={(person.addresses && person.addresses.history) || []}
            />
          </Block>
        ),
      },

      /* ===== Имущество ===== */
      {
        key: "assets",
        title: "Имущество",
        content: (
          <div className="grid md:grid-cols-2 gap-3">
            <Block title="Недвижимость" count={person.properties?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "type", label: "Тип", width: 140 },
                  { key: "city", label: "Город", width: 160 },
                  { key: "area", label: "Площадь, м²", width: 140, align: "center", nowrap: true },
                  { key: "cadastral", label: "Кадастр", align: "left", clamp: 1 },
                  { key: "ownedSince", label: "Владение с", width: 160, align: "left", nowrap: true, render: (r) => fmtDate(r.ownedSince) },
                ]}
                rows={person.properties || []}
              />
            </Block>

            <Block title="Транспорт" count={person.vehicles?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "brand", label: "Бренд", width: 160 },
                  { key: "model", label: "Модель", width: 180 },
                  { key: "vin", label: "VIN", nowrap: true },
                  { key: "plate", label: "Номер", width: 160, nowrap: true },
                  { key: "owned", label: "Владение", width: 120, render: (r) => (r.owned ? "да" : "нет") },
                ]}
                rows={person.vehicles || []}
              />
            </Block>
          </div>
        ),
      },

      /* ===== Активность ===== */
      {
        key: "activity",
        title: "Активность",
        content: (
          <div className="grid md:[grid-template-columns:1.2fr_1fr_1.4fr] gap-3">
            <Block title="Обращения (тикеты)" count={person.tickets?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "id", label: "ID", width: 100, align: "right", nowrap: true },
                  { key: "type", label: "Тип", width: 160 },
                  { key: "status", label: "Статус", width: 140 },
                  { key: "priority", label: "Приоритет", width: 140 },
                  { key: "createdAt", label: "Создано", width: 160, align: "right", nowrap: true, render: (r) => fmtDateShort(r.createdAt) },
                ]}
                rows={person.tickets || []}
              />
            </Block>

            <Block title="Визиты" count={person.visits?.length || 0}>
              <TableKit
                preset="medium"
                cols={[
                  { key: "date", label: "Дата", width: 140, align: "right", nowrap: true, render: (r) => fmtDateShort(r.date) },
                  { key: "channel", label: "Канал", width: 140, nowrap: true },
                  { key: "durationMin", label: "Длительность, мин", width: 160, align: "center", nowrap: true },
                ]}
                rows={person.visits || []}
              />
            </Block>

            <Block title="Задачи" count={person.tasks?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "title", label: "Название", clamp: 1, minWidth: 160 },
                  { key: "assignee", label: "Ответственный", clamp: 1, minWidth: 180 },
                  { key: "status", label: "Статус", width: 140, nowrap: true },
                  { key: "due", label: "Срок", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.due) },
                ]}
                rows={person.tasks || []}
              />
            </Block>
          </div>
        ),
      },

      /* ===== Обучение и членства ===== */
      {
        key: "education_extra",
        title: "Обучение и членства",
        content: (
          // «Тренинги» шире остальных двух
          <div className="grid md:[grid-template-columns:1.3fr_1fr_1fr] gap-3">
            <Block title="Тренинги" count={person.trainings?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "title", label: "Название", clamp: 1, minWidth: 220 },
                  { key: "provider", label: "Провайдер", width: 180, nowrap: true },
                  { key: "date", label: "Дата", width: 140, align: "right", nowrap: true, render: (r) => fmtDate(r.date) },
                  { key: "hours", label: "Часы", width: 110, align: "right", nowrap: true },
                  { key: "certificate", label: "Сертификат", nowrap: true },
                ]}
                rows={person.trainings || []}
              />
            </Block>

            <Block title="Сертификации" count={person.certifications?.length || 0}>
              <TableKit
                preset="medium"
                cols={[
                  { key: "name", label: "Название", clamp: 1, minWidth: 150 },
                  { key: "validUntil", label: "Действует до", width: 150, align: "left", nowrap: true, render: (r) => fmtDate(r.validUntil) },
                ]}
                rows={person.certifications || []}
              />
            </Block>

            <Block title="Членства" count={person.memberships?.length || 0}>
              <TableKit
                preset="medium"
                cols={[
                  { key: "org", label: "Организация", clamp: 1, minWidth: 150 },
                  { key: "role", label: "Роль", width: 160, nowrap: true },
                  { key: "from", label: "С", width: 150, align: "right", nowrap: true, render: (r) => fmtDate(r.from) },
                ]}
                rows={person.memberships || []}
              />
            </Block>
          </div>
        ),
      },

      /* ===== Вложения и заметки ===== */
      {
        key: "files_notes",
        title: "Вложения и заметки",
        content: (
          <div className="grid md:[grid-template-columns:1.1fr_1fr_1.3fr] gap-3">
            <Block title="Экстренные контакты" count={person.emergencyContacts?.length || 0}>
              <TableKit
                preset="medium"
                hScroll
                cols={[
                  { key: "name", label: "Имя",       minWidth: 140, clamp: 1 },
                  { key: "relation", label: "Отношение", minWidth: 150, nowrap: true }, 
                  { key: "phone", label: "Телефон",  width: 150,  nowrap: true },
                ]}
                rows={person.emergencyContacts || []}
              />
            </Block>

            <Block title="Файлы" count={person.attachments?.length || 0}>
              <TableKit
                preset="medium"
                cols={[
                  { key: "name", label: "Файл", clamp: 1, minWidth: 140 },
                  { key: "sizeKb", label: "Размер (КБ)", width: 120, align: "center", nowrap: true },
                  {
                    key: "url",
                    label: "Ссылка",
                    nowrap: true,
                    render: (r) => (
                      <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                        {r.url}
                      </a>
                    ),
                  },
                ]}
                rows={person.attachments || []}
              />
            </Block>

            <Block title="Заметки" count={person.notes?.length || 0}>
              <TableKit
                preset="wide"
                cols={[
                  { key: "date", label: "Дата", width: 140, align: "left", nowrap: true, render: (r) => fmtDateShort(r.date) },
                  { key: "author", label: "Автор", width: 160, nowrap: true },
                  { key: "text", label: "Текст", clamp: 2, minWidth: 160 },
                ]}
                rows={person.notes || []}
              />
            </Block>
          </div>
        ),
      },

      /* ===== Метаданные ===== */
      {
        key: "meta",
        title: "Метаданные",
        content: (
          <Block title="Служебная информация">
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-eco-mute">ID: </span>
                {person.id}
              </div>
              <div>
                <span className="text-eco-mute">Создано: </span>
                {createdAt}
              </div>
              <div>
                <span className="text-eco-mute">Обновлено: </span>
                {updatedAt}
              </div>
              <div>
                <span className="text-eco-mute">Город: </span>
                {person.city}
              </div>
              {Array.isArray(person.tags) && person.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {person.tags.map((t, i) => (
                    <Pill key={i}>{t}</Pill>
                  ))}
                </div>
              ) : null}
            </div>
          </Block>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fio,
    gender,
    birth,
    email,
    phone,
    tg,
    wa,
    viber,
    skype,
    website,
    regAddress,
    liveAddress,
    org,
    position,
    educationLevel,
    university,
    graduationYear,
    docs,
    family,
    consents,
    person,
  ]);

  /* =========================================================
     Рендер
  ========================================================= */
  return (
    <Card className="h-full w-full mx-auto px-6
  xl:max-w-[1440px] 2xl:max-w-[1760px]">
      {/* Герой-хедер */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-eco-blue text-white grid place-items-center font-semibold">
            {initials(fio)}
          </div>
          <div className="min-w-0">
            <div className="text-[22px] font-semibold truncate">{fio}</div>
            <div className="text-eco-mute text-sm truncate">
              {person.city} • {birth ? fmtDate(birth) : ""} • {calcAge(birth)}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <StatusPill status={status} />
              {Array.isArray(person.tags) &&
                person.tags.map((t, i) => (
                  <Pill key={i} tone="gray">
                    {t}
                  </Pill>
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-eco-border bg-white text-sm"
            >
              Позвонить
            </a>
          )}
          {email && (
            <a 
              href={`mailto:${email}`} 
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-eco-border bg-white text-sm"
            >
              Написать
            </a>
          )}
          <select
            className="h-9 px-2 rounded-lg border border-eco-border bg-white text-sm"
            value={status}
            onChange={(e) => changeStatus(e.target.value)}
            title="Сменить статус"
          >
            <option>активен</option>
            <option>на паузе</option>
            <option>архив</option>
          </select>
          {onOpenRegistry && (
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm" onClick={onOpenRegistry}>
              К списку
            </button>
          )}
          {onOpenMiniCard && (
            <button className="h-9 px-3 rounded-lg border border-eco-border bg-white text-sm" onClick={onOpenMiniCard}>
              Открыть мини-панель
            </button>
          )}
        </div>
      </div>

      {/* Переключатель вида */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-eco-mute mr-1">Вид:</span>
          <button
            className={`h-9 px-3 rounded-lg border text-sm ${
              view === "tabs" ? "border-eco-border bg-white" : "border-transparent hover:border-eco-border bg-eco-bg"
            }`}
            onClick={() => setView("tabs")}
          >
            Вкладки
          </button>
          <button
            className={`h-9 px-3 rounded-lg border text-sm ${
              view === "sections" ? "border-eco-border bg-white" : "border-transparent hover:border-eco-border bg-eco-bg"
            }`}
            onClick={() => setView("sections")}
          >
            Разделы
          </button>
        </div>
      </div>

      {/* Навигация вкладок */}
      {view === "tabs" && (
        <div className="flex gap-2 mb-4">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`px-3 py-1 rounded-full text-sm ${
                tab === s.key ? "bg-eco-green/30" : "bg-eco-bg text-eco-mute"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Контент */}
      {view === "tabs" ? (
        <div className="space-y-6">
          <Section title={sections.find((x) => x.key === tab)?.title || ""}>
            {sections.find((x) => x.key === tab)?.content}
          </Section>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[220px_1fr] gap-4">
          <QuickNav
            sections={sections}
            activeKey={tab}
            onSelect={(k) => {
              setTab(k);
              const el = document.getElementById(`sec-${k}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <div className="space-y-6">
            {sections.map((s) => (
              <Section key={s.key} title={s.title} id={`sec-${s.key}`}>
                {s.content}
              </Section>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
