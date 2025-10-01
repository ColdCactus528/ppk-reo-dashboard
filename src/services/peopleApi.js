// --- импорт генератора подробностей ---
import { generatePersonDetails } from "../lib/generatePerson";

// --- кэш для детальных данных (по id) ---
const DETAILS = new Map();

// ---------------- БАЗОВАЯ БД (лёгкая) ----------------
let DB = null;

const STATUSES = ["активен", "на паузе", "архив"];
const GENDERS  = ["муж", "жен"];
const CITIES   = [
  "Москва","Санкт-Петербург","Новосибирск","Екатеринбург","Казань",
  "Нижний Новгород","Челябинск","Самара","Уфа","Ростов-на-Дону",
  "Пермь","Воронеж","Волгоград","Красноярск","Омск"
];

const SIZE = 100_000;

// --- utils ---
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad2(n){ return n<10?`0${n}`:String(n); }
function digits(s){ return String(s || "").replace(/\D+/g, ""); }
function chance(p = 0.5){ return Math.random() < p; }

// --- генерация одной «лёгкой» персоны для списка ---
function makePerson(id){
  const gender = rand(GENDERS);

  // FIO (упрощённые), чтобы были русские буквы
  const firstM = ["Алексей","Иван","Дмитрий","Роман","Тимур","Сергей","Михаил","Артём","Кирилл","Егор"];
  const lastM  = ["Кузнецов","Сидоров","Романов","Николаев","Петров","Смирнов","Соколов","Васильев","Морозов","Лебедев"];
  const firstF = ["Анна","Екатерина","Ольга","Ирина","Мария","Татьяна","Елена","Алина","Вероника","Дарья"];
  const lastF  = ["Кузнецова","Сидорова","Романова","Николаева","Петрова","Смирнова","Соколова","Васильева","Морозова","Лебедева"];

  const first = gender === "муж" ? rand(firstM) : rand(firstF);
  const last  = gender === "муж" ? rand(lastM)  : rand(lastF);

  const middleM = ["Иванович","Сергеевич","Дмитриевич","Романович","Тимурович","Алексеевич"];
  const middleF = ["Ивановна","Сергеевна","Дмитриевна","Романовна","Тимуровна","Алексеевна"];

  const city   = rand(CITIES);
  const status = rand(STATUSES);

  // дата рождения 1965—2004
  const y = 1965 + Math.floor(Math.random()*40);
  const m = 1 + Math.floor(Math.random()*12);
  const d = 1 + Math.floor(Math.random()*28);
  const birth = `${y}-${pad2(m)}-${pad2(d)}`;

  const fio = `${last} ${first} ${gender === "муж" ? rand(middleM) : rand(middleF)}`;

  const emailLogin = `${last}.${first}`
    .toLowerCase()
    .replaceAll("ё","e")
    .replaceAll("й","i")
    .replace(/[^\w.]/g,"");

  const domains = ["mail.ru","gmail.com","yandex.ru","rambler.ru","bk.ru"];
  // ~6% пустых email
  const email = chance(0.94) ? `${emailLogin}@${rand(domains)}` : "";

  // ~3% пустых телефонов
  const phone = chance(0.97)
    ? `+7 ${900 + Math.floor(Math.random()*100)} ${String(Math.floor(Math.random()*1000)).padStart(3,"0")}-${pad2(Math.floor(Math.random()*100))}-${pad2(Math.floor(Math.random()*100))}`
    : "";

  const regAddress = `${city}, ул. Школьная, д. ${1 + Math.floor(Math.random()*120)}`;

  // Лёгкая запись: только поля, нужные для списка/быстрой фильтрации
  return { id, fio, gender, birth, city, email, phone, status, regAddress };
}

// --- база ---
function getDB(size = SIZE){
  if (DB) return DB;
  DB = Array.from({length: size}, (_,i)=> makePerson(i+1));
  return DB;
}

// ----------------- HELPERS: фильтры/сортировка/пагинация -----------------
function ageFromBirth(birth){
  if (!birth) return null;
  const b = new Date(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}

// общий поиск по ФИО, городу, email и (если в запросе ≥5 цифр) по телефону
function applyTextQuery(rows, q){
  if (!q) return rows;
  const s = String(q).trim().toLowerCase();
  if (!s) return rows;

  const qDigits = digits(s);
  const hasPhoneNeedle = qDigits.length >= 5;

  return rows.filter(r => {
    if (String(r.fio).toLowerCase().includes(s)) return true;
    if (String(r.city).toLowerCase().includes(s)) return true;
    if (String(r.email || "").toLowerCase().includes(s)) return true;
    if (hasPhoneNeedle && digits(r.phone).includes(qDigits)) return true;
    return false;
  });
}

// быстрый селект по статусу
function applyStatus(rows, status){
  if (!status || status === "all") return rows;
  return rows.filter(r => r.status === status);
}

// детальные фильтры из модалки
function applyFilters(rows, filters = {}){
  const f = filters || {};

  const statuses     = Array.isArray(f.statuses) ? f.statuses : [];
  const genders      = Array.isArray(f.genders) ? f.genders : [];
  const cities       = Array.isArray(f.cities) ? f.cities : [];
  const emailDomains = Array.isArray(f.emailDomains) ? f.emailDomains.map(x => String(x).toLowerCase()) : [];
  const hasEmail     = f.hasEmail; // true | false | null
  const hasPhone     = f.hasPhone; // true | false | null
  const age          = Array.isArray(f.age) ? f.age : [null, null];
  const birth        = Array.isArray(f.birth) ? f.birth : ["", ""];

  return rows.filter(r => {
    if (statuses.length && !statuses.includes(r.status)) return false;
    if (genders.length && !genders.includes(r.gender)) return false;
    if (cities.length && !cities.includes(r.city)) return false;

    if (emailDomains.length){
      const domain = String(r.email || "").split("@")[1]?.toLowerCase() || "";
      if (!emailDomains.includes(domain)) return false;
    }

    if (hasEmail != null){
      const ok = hasEmail ? !!r.email : !r.email;
      if (!ok) return false;
    }
    if (hasPhone != null){
      const ok = hasPhone ? !!r.phone : !r.phone;
      if (!ok) return false;
    }

    const [ageMin, ageMax] = age;
    if (ageMin != null || ageMax != null){
      const a = ageFromBirth(r.birth);
      if (ageMin != null && a < Number(ageMin)) return false;
      if (ageMax != null && a > Number(ageMax)) return false;
    }

    const [birthFrom, birthTo] = birth;
    if (birthFrom && new Date(r.birth) < new Date(birthFrom)) return false;
    if (birthTo   && new Date(r.birth) > new Date(birthTo))   return false;

    return true;
  });
}

function applySort(rows, spec = []){
  if (!Array.isArray(spec) || spec.length === 0) return rows;
  const dir = d => (d === "desc" ? -1 : 1);
  const get = (obj, key) => obj[key];
  const copy = rows.slice();
  copy.sort((a,b)=>{
    for (const s of spec){
      const av = get(a, s.key); const bv = get(b, s.key);
      if (av == null && bv != null) return -1 * dir(s.dir);
      if (av != null && bv == null) return  1 * dir(s.dir);
      if (av < bv) return -1 * dir(s.dir);
      if (av > bv) return  1 * dir(s.dir);
    }
    return 0;
  });
  return copy;
}

function selectFields(rows, select){
  if (!Array.isArray(select) || select.length === 0) return rows;
  const keys = Array.from(new Set(["id", ...select]));
  return rows.map(r => {
    const o = {};
    for (const k of keys) o[k] = r[k];
    return o;
  });
}

function delay(ms, signal){
  return new Promise((res,rej)=>{
    const t = setTimeout(res, ms);
    if (signal){
      signal.addEventListener("abort", ()=>{ clearTimeout(t); rej(new DOMException("aborted","AbortError")); }, { once: true });
    }
  });
}

// --------------------------- API ---------------------------

// cursor — строковый индекс начала страницы
export async function fetchPeople({
  cursor="0",
  limit=100,
  q="",
  status="all",
  sort=[],
  select=[],
  filters={},
  signal
} = {}){
  await delay(150, signal); // имитация сети

  const db = getDB();

  let rows = db;
  rows = applyTextQuery(rows, q);
  rows = applyStatus(rows, status);
  rows = applyFilters(rows, filters);
  rows = applySort(rows, sort);

  const total = rows.length;

  // постранично по cursor
  const from = parseInt(cursor, 10) || 0;
  const to   = Math.min(from + limit, rows.length);
  const page = rows.slice(from, to);

  const items = selectFields(page, select);
  const nextCursor = to < rows.length ? String(to) : null;

  return { items, nextCursor, total };
}

// Детальная карточка: подмешиваем «тяжёлые» данные (>150 полей) лениво и кэшируем
export async function fetchPersonById(id, { signal } = {}){
  await delay(120, signal);
  const base = getDB().find(x => String(x.id) === String(id));
  if (!base) return null;

  let details = DETAILS.get(base.id);
  if (!details) {
    details = generatePersonDetails(base.id);
    DETAILS.set(base.id, details);
  }
  return { ...base, ...details }; // клон с деталями
}
