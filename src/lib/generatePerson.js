/* ========= детерминированный RNG ========= */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = (rng, min = 0, max = 1) => rng() * (max - min) + min;
const randint = (rng, a, b) => Math.floor(rnd(rng, a, b + 1));
const rbool = (rng, p = 0.5) => rng() < p;
const rpick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const rdate = (rng, y1, y2) => {
  const y = randint(rng, y1, y2), m = randint(rng, 1, 12), d = randint(rng, 1, 28);
  return `${y}-${pad2(m)}-${pad2(d)}`;
};
const digits = (rng, n) => Array.from({ length: n }, () => randint(rng, 0, 9)).join("");

/* ========= справочники ========= */
const EDU_LEVELS = ["Среднее", "Среднее спец.", "Высшее", "Магистр", "Кандидат наук", "Доктор наук"];
const JOB_TYPES = ["штат", "контракт", "совместительство", "стажировка"];
const DEPARTMENTS = ["IT", "Финансы", "Закупки", "Продажи", "Маркетинг", "HR", "Юридический", "Логистика", "Экология"];
const CONSENT_TYPES = ["ПДн", "Маркетинг", "Геолокация", "Cookie"];
const BLOOD_TYPES = ["0(I)−","0(I)+","A(II)−","A(II)+","B(III)−","B(III)+","AB(IV)−","AB(IV)+"];
const LANGS = ["ru","en","de","fr","es","zh"];
const BANKS = ["Сбер", "Т-Банк", "ВТБ", "Альфа", "Райффайзен"];
const VEH_BRANDS = ["Лада","Киа","Хёндай","Тойота","Шкода","VW","BMW","Audi"];
const CITIES = ["Москва","СПб","Новосибирск","Екатеринбург","Казань","Нижний Новгород","Челябинск","Самара","Уфа","Ростов-на-Дону"];

/* ========= генераторы связанных наборов ========= */
function genDocuments(rng, id) {
  const count = randint(rng, 2, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `DOC-${id}-${i+1}`,
    type: rpick(rng, ["паспорт","загранпаспорт","вод. удостоверение","СНИЛС","ИНН","ОМС"]),
    series: `${digits(rng,2)}${digits(rng,2)}`,
    number: `${digits(rng,6)}`,
    issueDate: rdate(rng, 2000, 2023),
    issuer: rpick(rng, ["ОВД Центрального района","ГУ МВД","МФЦ"]),
    expires: rbool(rng, 0.7) ? rdate(rng, 2026, 2034) : "",
    comment: rbool(rng, 0.2) ? "замена по достижении возраста" : ""
  }));
}
function genFamily(rng, id) {
  const rels = ["муж","жена","сын","дочь","отец","мать","брат","сестра"];
  const count = randint(rng, 0, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `FAM-${id}-${i+1}`,
    fio: `Фамилия${i+1} Имя${i+1} Отчество${i+1}`,
    relation: rpick(rng, rels),
    birth: rdate(rng, 1955, 2018),
    phone: rbool(rng, 0.85) ? `+7 ${900+randint(rng,0,99)} ${String(randint(rng,0,999)).padStart(3,'0')}-${pad2(randint(rng,0,99))}-${pad2(randint(rng,0,99))}` : "",
    isDependent: rbool(rng,0.3)
  }));
}
function genJobs(rng, id) {
  const count = randint(rng, 0, 7);
  return Array.from({ length: count }, (_, i) => ({
    id: `JOB-${id}-${i+1}`,
    org: `ООО «Компания ${randint(rng,1,99)}»`,
    position: rpick(rng, ["Инженер","Менеджер","Специалист","Аналитик","Разработчик","Эколог"]),
    department: rpick(rng, DEPARTMENTS),
    start: rdate(rng, 2005, 2021),
    end: rbool(rng, 0.55) ? rdate(rng, 2022, 2025) : "",
    type: rpick(rng, JOB_TYPES),
    salary: rbool(rng, 0.75) ? randint(rng, 40, 300) * 1000 : null,
    isCurrent: false
  })).map((j, i, arr) => (i === arr.length - 1 ? { ...j, isCurrent: !j.end } : j));
}
function genEducations(rng, id) {
  const count = randint(rng, 0, 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `EDU-${id}-${i+1}`,
    university: `Университет №${randint(rng,1,80)}`,
    faculty: rpick(rng, ["ФКН","ФЭФ","ФИТ","Юрфак","Эконом"]),
    specialty: rpick(rng, ["Экономика","Право","Информатика","Менеджмент","Экология"]),
    level: rpick(rng, EDU_LEVELS),
    gradYear: randint(rng, 2004, 2024),
    diploma: rbool(rng,0.7) ? `Д-${digits(rng,7)}` : ""
  }));
}
function genAddressesHistory(rng, id) {
  const count = randint(rng, 0, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `ADDR-${id}-${i+1}`,
    address: `${rpick(rng, CITIES)}, ул. ${randint(rng,1,120)}, д. ${randint(rng,1,250)}`,
    from: rdate(rng, 2001, 2020),
    to: rbool(rng, 0.7) ? rdate(rng, 2021, 2025) : ""
  }));
}
function genTickets(rng, id) {
  const count = randint(rng, 0, 14);
  return Array.from({ length: count }, (_, i) => ({
    id: `TKT-${id}-${i+1}`,
    type: rpick(rng, ["инцидент","запрос","жалоба"]),
    createdAt: rdate(rng, 2022, 2025),
    status: rpick(rng, ["open","in_progress","done"]),
    priority: rpick(rng, ["низкий","средний","высокий"])
  }));
}
function genVisits(rng, id) {
  const count = randint(rng, 0, 10);
  return Array.from({ length: count }, (_, i) => ({
    id: `VIS-${id}-${i+1}`,
    date: rdate(rng, 2023, 2025),
    channel: rpick(rng, ["web","mobile","office"]),
    durationMin: randint(rng, 1, 120)
  }));
}
function genBankAccounts(rng) {
  const count = randint(rng, 0, 2);
  return Array.from({ length: count }, (_, i) => ({
    bank: rpick(rng, BANKS),
    iban: `40817${digits(rng, 15)}`,
    primary: i === 0
  }));
}
function genProperties(rng, id) {
  const count = randint(rng, 0, 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `PR-${id}-${i+1}`,
    type: rpick(rng, ["квартира","дом","земля","гараж"]),
    city: rpick(rng, CITIES),
    area: randint(rng, 20, 180), // м²
    cadastral: `77:${randint(rng,1,99)}:${digits(rng,6)}:${randint(rng,1,9999)}`,
    ownedSince: rdate(rng, 2005, 2024),
  }));
}
function genVehicles(rng, id) {
  const count = randint(rng, 0, 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `VH-${id}-${i+1}`,
    brand: rpick(rng, VEH_BRANDS),
    model: `Модель-${randint(rng, 1, 7)}`,
    vin: `XW${digits(rng,15)}`,
    plate: `${String.fromCharCode(1040+randint(rng,0,31))}${String.fromCharCode(1040+randint(rng,0,31))} ${randint(rng,100,999)} ${String.fromCharCode(1040+randint(rng,0,31))}${String.fromCharCode(1040+randint(rng,0,31))}`,
    owned: rbool(rng, 0.7)
  }));
}
function genTrainings(rng, id) {
  const count = randint(rng, 0, 4);
  return Array.from({ length: count }, (_, i) => ({
    id: `TR-${id}-${i+1}`,
    title: rpick(rng, ["ОТ и ТБ","Пожарная безопасность","GDPR/152-ФЗ","Экология производства","Первая помощь"]),
    provider: rpick(rng, ["УчЦентр А","УчЦентр Б","Внутренний тренинг"]),
    date: rdate(rng, 2018, 2025),
    hours: randint(rng, 4, 40),
    certificate: rbool(rng,0.8) ? `CERT-${digits(rng,7)}` : ""
  }));
}
function genCertifications(rng, id) {
  const count = randint(rng, 0, 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `CR-${id}-${i+1}`,
    name: rpick(rng, ["ISO 14001","Охрана труда","Промбезопасность","Врачебная комиссия"]),
    validUntil: rdate(rng, 2026, 2032)
  }));
}
function genMemberships(rng, id) {
  const count = randint(rng, 0, 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `MB-${id}-${i+1}`,
    org: rpick(rng, ["Союз волонтёров","Экосообщество","Профсоюз"]),
    from: rdate(rng, 2015, 2024),
    role: rpick(rng, ["участник","координатор","руководитель"])
  }));
}
function genMedical(rng, id) {
  const count = randint(rng, 0, 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `MED-${id}-${i+1}`,
    type: rpick(rng, ["осмотр","прививка","анализ"]),
    date: rdate(rng, 2019, 2025),
    result: rpick(rng, ["норма","наблюдение","лечение"]),
    doctor: `врач ${randint(rng,1,500)}`
  }));
}
function genEmergency(rng, id) {
  const count = randint(rng, 1, 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `EC-${id}-${i+1}`,
    name: `Контакт-${i+1}`,
    relation: rpick(rng, ["друг","родственник","коллега"]),
    phone: `+7${digits(rng,10)}`
  }));
}
function genAttachments(rng, id) {
  const count = randint(rng, 0, 4);
  return Array.from({ length: count }, (_, i) => ({
    id: `ATT-${id}-${i+1}`,
    name: `Файл_${i+1}.pdf`,
    url: `https://example.com/f/${id}/${i+1}`,
    sizeKb: randint(rng, 50, 800)
  }));
}
function genNotes(rng, id) {
  const count = randint(rng, 0, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `NOTE-${id}-${i+1}`,
    date: rdate(rng, 2023, 2025),
    author: rpick(rng, ["оператор 1","оператор 2","система"]),
    text: `Заметка ${i+1} по клиенту #${id}`
  }));
}
function genTasks(rng, id) {
  const count = randint(rng, 0, 6);
  return Array.from({ length: count }, (_, i) => ({
    id: `TASK-${id}-${i+1}`,
    title: `Задача ${i+1}`,
    due: rdate(rng, 2024, 2026),
    status: rpick(rng, ["todo","in_progress","done"]),
    assignee: rpick(rng, ["оператор 1","оператор 2","бот"])
  }));
}

/* ========= основной экспорт ========= */
export function generatePersonDetails(id) {
  const rng = mulberry32(Number(id) || 1);

  // ------ простые поля (инпуты/селекты/чекбоксы) ------
  const profile = {
    // гражданско-правовой блок
    maritalStatus: rpick(rng, ["не женат/не замужем","женат/замужем","в разводе","вдовец/вдова"]),
    citizenship: rpick(rng, ["РФ","РФ/ЕС","иное"]),
    nationality: rpick(rng, ["русский","татарин","украинец","белорус","еврей","армянин","другое"]),
    hasChildren: randint(rng, 0, 4),
    disabilityGroup: rbool(rng,0.1) ? randint(rng,1,3) : 0,

    // здоровье
    bloodType: rpick(rng, BLOOD_TYPES),
    heightCm: randint(rng, 150, 200),
    weightKg: randint(rng, 45, 120),
    allergies: rbool(rng,0.35) ? rpick(rng, ["пыльца","лекарства","лактоза","глютен","шерсть"]) : "",

    // документы-идентификаторы
    inn: digits(rng, 12),
    snils: `${digits(rng,3)}-${digits(rng,3)}-${digits(rng,3)} ${digits(rng,2)}`,
    omsPolicy: `ОМС-${digits(rng,16)}`,
    driverLicenseNumber: `${digits(rng,2)} ${digits(rng,2)} ${digits(rng,6)}`,
    driverLicenseIssue: rdate(rng, 2012, 2022),
    driverLicenseExpire: rdate(rng, 2026, 2034),
    driverCategories: ["B"].concat(rbool(rng,0.3) ? ["A"] : []).concat(rbool(rng,0.2) ? ["C"] : []),

    // контактные предпочтения
    preferredLanguage: rpick(rng, LANGS),
    preferredContact: rpick(rng, ["phone","email","telegram","whatsapp"]),
    allowCalls: rbool(rng, 0.75),
    allowEmail: rbool(rng, 0.85),
    allowSms: rbool(rng, 0.7),
    doNotDisturb: rbool(rng, 0.1),
    contactTimeFrom: `${pad2(randint(rng,8,11))}:00`,
    contactTimeTo: `${pad2(randint(rng,18,21))}:00`,

    // занятость/доход
    employmentStatus: rpick(rng, ["работает","самозанятый","безработный","студент","пенсионер"]),
    incomeLevel: rpick(rng, ["низкий","средний","высокий"]),
    creditScore: randint(rng, 250, 900),

    // проживание
    housingType: rpick(rng, ["собственное","аренда","общежитие","родственники"]),
    livingSince: rdate(rng, 2010, 2024),
    hasCar: rbool(rng, 0.55),
    hasPets: rbool(rng, 0.35),
    petTypes: rbool(rng,0.35) ? rpick(rng, ["кошка","собака","птицы","рыбы","прочее"]) : "",

    // соцсети/ссылки
    website: rbool(rng,0.4) ? `https://site-${id}.example.com` : "",
    telegram: rbool(rng,0.6) ? `@user_${digits(rng,4)}` : "",
    whatsapp: rbool(rng,0.5) ? `+7${digits(rng,10)}` : "",
    viber: rbool(rng,0.3) ? `+7${digits(rng,10)}` : "",
    skype: rbool(rng,0.2) ? `live:${digits(rng,9)}` : "",

    // согласия (как чекбоксы + даты)
    consentPD: rbool(rng,0.9),  consentPDDate: rdate(rng, 2020, 2025),
    consentGeo: rbool(rng,0.7), consentGeoDate: rdate(rng, 2021, 2025),
    consentMkt: rbool(rng,0.6), consentMktDate: rdate(rng, 2021, 2025),

    // риск/комплаенс
    riskLevel: rpick(rng, ["низкий","средний","высокий"]),
    blacklisted: rbool(rng, 0.02),
  };

  // Доп. плоские настроки (чтобы точно перевалить 150 с запасом)
  const extra = {};
  for (let i = 1; i <= 50; i++) extra[`customField_${i}`] = rpick(rng, [true,false, randint(rng,0,9999), `val_${digits(rng,4)}`]);

  // ------ связанные таблицы ------
  const documents = genDocuments(rng, id);
  const family = genFamily(rng, id);
  const jobs = genJobs(rng, id);
  const educations = genEducations(rng, id);
  const addresses = { history: genAddressesHistory(rng, id) };
  const tickets = genTickets(rng, id);
  const visits = genVisits(rng, id);
  const bankAccounts = genBankAccounts(rng);
  const properties = genProperties(rng, id);
  const vehicles = genVehicles(rng, id);
  const trainings = genTrainings(rng, id);
  const certifications = genCertifications(rng, id);
  const memberships = genMemberships(rng, id);
  const medicalRecords = genMedical(rng, id);
  const emergencyContacts = genEmergency(rng, id);
  const attachments = genAttachments(rng, id);
  const notes = genNotes(rng, id);
  const tasks = genTasks(rng, id);

  // теги
  const tags = Array.from({ length: randint(rng,0,8) }, () => rpick(rng, ["льгота","многодетный","ветеран","волонтёр","участник эко-акций","переработка"]));

  // метаданные
  const meta = {
    createdAt: rdate(rng, 2019, 2024),
    updatedAt: rdate(rng, 2024, 2025),
    source: rpick(rng, ["web","import","operator"]),
    score: randint(rng, 10, 100)
  };

  return {
    // плоские «инпутные» поля
    ...profile,
    ...extra,

    // связанные таблицы
    documents, family, jobs, educations, addresses,
    tickets, visits, bankAccounts, properties, vehicles,
    trainings, certifications, memberships, medicalRecords,
    emergencyContacts, attachments, notes, tasks,

    // прочее
    tags, meta
  };
}
