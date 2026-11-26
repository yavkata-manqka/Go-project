// „Мозъкът“ на демото: всички данни се пазят в браузъра (localStorage).
// Няма сървър и няма истински лични данни.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PSYCHOLOGISTS } from './data/psychologists'

const KEY = 'gotu-demo-v1'
const DAY = 24 * 60 * 60 * 1000
// Непотвърден час се освобождава 2 часа преди началото
export const CONFIRM_DEADLINE = 2 * 60 * 60 * 1000

// ---------- дати ----------
export const dateKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY)
export const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / DAY)
export const weekKey = (d) => {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // понеделник = 0
  return dateKey(addDays(x, -day))
}
const WEEKDAYS = ['нед', 'пон', 'вт', 'ср', 'чет', 'пет', 'съб']
export const fmtDay = (d) => {
  const x = new Date(d)
  return `${WEEKDAYS[x.getDay()]}, ${x.getDate()}.${String(x.getMonth() + 1).padStart(2, '0')}`
}
export const fmtTime = (d) => {
  const x = new Date(d)
  return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}

// ---------- часове за запазване ----------
// Свободни часове за следващите 10 дни (без събота и неделя).
export function generateSlots(now) {
  const slots = []
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < 10; i++) {
    const day = addDays(start, i)
    const wd = day.getDay()
    if (wd === 0 || wd === 6) continue
    for (const p of PSYCHOLOGISTS) {
      for (const h of p.hours) {
        const t = new Date(day)
        t.setHours(h, 0, 0, 0)
        if (t.getTime() < new Date(now).getTime() + 60 * 60 * 1000) continue
        const id = `${p.id}-${dateKey(t)}-${h}`
        // „Заети“ от други ученици – детерминирано, за да изглежда реалистично
        let hsh = 0
        for (const c of id) hsh = (hsh * 31 + c.charCodeAt(0)) >>> 0
        slots.push({ id, psychId: p.id, start: t.toISOString(), takenByOther: hsh % 10 < 3 })
      }
    }
  }
  return slots
}

// ---------- първоначални демо данни ----------
const DEMO_NICKS = ['Луна🌙', 'Зоро', 'Пиксел', 'Мечо', 'Кафенце', 'Звездичка', 'Нинджа42', 'Ябълка']

function seedStudent(now) {
  const today = dateKey(now)
  // история на настроението за последните 14 дни (без днес)
  const moods = [4, 3, 4, 5, 3, 4, 4, 3, 5, 4, 3, 4, 2, 2]
  const moodHistory = moods.map((level, i) => ({ date: dateKey(addDays(now, -(14 - i))), level }))
  return {
    nickname: 'Котенце🐾',
    avatar: '🐱',
    age: 15,
    code: 'GOTU-012',
    consentUnder14: true,
    consentLevel2: false,
    streak: 12,
    lastCheckIn: dateKey(addDays(now, -1)),
    freezeWeek: weekKey(now),
    freezesUsed: 0,
    moodHistory,
    badges: ['first', 'week', 'breath', 'gratitude', 'reader'],
    missionsDone: {},
    journal: [],
    readArticles: ['school-1', 'friends-1', 'self-1'],
    noShows: 0,
    lowMoodDismissed: '',
    lastMessage: null,
    today,
  }
}

function seedState() {
  const now = new Date()
  const ts = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()
  const codes = Array.from({ length: 20 }, (_, i) => {
    const code = `GOTU-${String(i + 1).padStart(3, '0')}`
    const usedIdx = [1, 2, 3, 4, 5, 7, 9, 12].indexOf(i + 1)
    return {
      code,
      school: i < 10 ? 'ПМГ „Акад. Н. Обрешков“ (демо)' : 'ПГЕЕ „К. Фотинов“ (демо)',
      used: usedIdx !== -1,
      usedBy: i + 1 === 12 ? 'Котенце🐾' : usedIdx !== -1 ? DEMO_NICKS[usedIdx] : null,
      active: true,
    }
  })
  const slots = generateSlots(now)
  const free = slots.filter((s) => !s.takenByOther)
  const later = free.filter((s) => new Date(s.start).getTime() > now.getTime() + 4 * 60 * 60 * 1000)
  const myFirst = later.find((s) => s.psychId === 'p1') || later[0]
  const others = later.filter((s) => s.id !== myFirst.id)

  return {
    version: 1,
    role: 'guest',
    dayOffset: 0,
    student: seedStudent(now),
    schoolCodes: codes,
    bookings: [
      { id: 'b-demo-me', owner: 'me', nickname: 'Котенце🐾', psychId: myFirst.psychId, slotId: myFirst.id, start: myFirst.start, mode: 'chat', status: 'booked', createdAt: ts(30) },
      { id: 'b-demo-2', owner: 'other', nickname: 'Луна🌙', psychId: 'p1', slotId: others[3]?.id, start: others[3]?.start, mode: 'live', status: 'confirmed', createdAt: ts(50) },
      { id: 'b-demo-3', owner: 'other', nickname: 'Пиксел', psychId: 'p2', slotId: others[6]?.id, start: others[6]?.start, mode: 'chat', status: 'booked', createdAt: ts(20) },
      { id: 'b-demo-4', owner: 'other', nickname: 'Мечо', psychId: 'p3', slotId: others[9]?.id, start: others[9]?.start, mode: 'chat', status: 'needs-approval', createdAt: ts(5), note: 'Има 2 пропуснати сесии' },
    ],
    community: [
      { id: 'c1', author: 'Елена Маринова', avatar: '🌷', kind: 'psych', text: 'Здравейте, хора! 💜 Тази седмица много от вас пишат за изпитите. Напомням: почивките са част от ученето, не мързел.', status: 'approved', ts: ts(26), reports: 0 },
      { id: 'c2', author: 'Луна🌙', avatar: '🦊', kind: 'student', text: 'Някой друг ли не може да спи преди контролно? Аз лежа до 2 и мисля 😩', status: 'approved', ts: ts(22), reports: 0 },
      { id: 'c3', author: 'Пиксел', avatar: '🐸', kind: 'student', text: 'Да, аз! Пробвах дишането 4-4-4 от мисиите и честно помогна малко.', status: 'approved', ts: ts(21), reports: 0 },
      { id: 'c4', author: 'Калоян Петков', avatar: '🎧', kind: 'psych', text: 'Пиксел, супер съвет! Луна, ако искаш, пиши ми в личен чат, ще измислим план заедно.', status: 'approved', ts: ts(20), reports: 0 },
      { id: 'c5', author: 'Звездичка', avatar: '⭐', kind: 'student', text: 'Днес за първи път казах на мама, че ми е тежко. Тя ме прегърна. Не очаквах 🥹', status: 'approved', ts: ts(6), reports: 0 },
      { id: 'c6', author: 'Нинджа42', avatar: '🐼', kind: 'student', text: 'Някой знае ли как да си намеря приятели в нов клас?', status: 'pending', ts: ts(2), reports: 0 },
      { id: 'c7', author: 'Зоро', avatar: '🐯', kind: 'student', text: 'Тоя чат е за хора без живот лол', status: 'approved', ts: ts(4), reports: 2 },
    ],
    reports: [
      { id: 'r1', msgId: 'c7', by: 'Звездичка', reason: 'Обидно', ts: ts(3) },
      { id: 'r2', msgId: 'c7', by: 'Луна🌙', reason: 'Обидно', ts: ts(3) },
    ],
    urgent: [
      { id: 'u1', who: 'Анонимен гост', where: 'Анонимен чат', text: '(демо) ...не искам да живея така повече...', ts: ts(30), status: 'handled', handledBy: 'Дария Костова' },
    ],
    privateChats: [
      {
        id: 'pc1', with: 'Луна🌙', avatar: '🦊', psychId: 'p1', unread: 1,
        messages: [
          { from: 'student', text: 'Здравейте, може ли да питам нещо за безсънието?', ts: ts(10) },
          { from: 'psych', text: 'Разбира се! Тук съм. Какво се случва вечер?', ts: ts(9) },
          { from: 'student', text: 'Просто мисля за всичко, което не съм направила...', ts: ts(1) },
        ],
      },
      {
        id: 'pc2', with: 'Пиксел', avatar: '🐸', psychId: 'p1', unread: 0,
        messages: [
          { from: 'student', text: 'Благодаря за вчера, беше полезно 🙏', ts: ts(28) },
          { from: 'psych', text: 'Радвам се! Ще се чуем в четвъртък.', ts: ts(27) },
        ],
      },
    ],
    activityLog: [],
  }
}

// ---------- контекст ----------
const StoreCtx = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s.version === 1) return s
    }
  } catch (e) {
    /* празно */
  }
  return seedState()
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [crisis, setCrisis] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (e) {
      /* празно */
    }
  }, [state])

  const now = useMemo(() => new Date(Date.now() + state.dayOffset * DAY), [state.dayOffset])

  // Освобождаване на непотвърдени часове и приключване на минали сесии
  useEffect(() => {
    setState((s) => {
      let changed = false
      const bookings = s.bookings.map((b) => {
        if (!b.start) return b
        const start = new Date(b.start).getTime()
        if ((b.status === 'booked' || b.status === 'needs-approval') && start - CONFIRM_DEADLINE <= now.getTime()) {
          changed = true
          return { ...b, status: 'released' }
        }
        if (b.status === 'confirmed' && start + 60 * 60 * 1000 <= now.getTime()) {
          changed = true
          return { ...b, status: 'done' }
        }
        return b
      })
      return changed ? { ...s, bookings } : s
    })
  }, [now])

  const update = (fn) =>
    setState((s) => {
      const n = structuredClone(s)
      fn(n)
      return n
    })

  const value = {
    state,
    now,
    update,
    crisis,
    openCrisis: () => setCrisis(true),
    closeCrisis: () => setCrisis(false),
    setRole: (role) => update((s) => (s.role = role)),
    resetDemo: () => {
      localStorage.removeItem(KEY)
      setState(seedState())
    },
    // Сигнал за спешен случай към психолозите
    flagUrgent: (who, where, text) =>
      update((s) => {
        s.urgent.unshift({ id: 'u' + Date.now(), who, where, text, ts: new Date().toISOString(), status: 'new' })
      }),
    // Демо: „превърти“ времето напред с един ден
    nextDay: () => update((s) => (s.dayOffset += 1)),
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

export const isActiveBooking = (b, now) =>
  ['booked', 'confirmed', 'needs-approval'].includes(b.status) && new Date(b.start).getTime() > now.getTime()

export const MOODS = [
  { level: 1, emoji: '😢', label: 'Много зле' },
  { level: 2, emoji: '😔', label: 'Не съм добре' },
  { level: 3, emoji: '😐', label: 'Горе-долу' },
  { level: 4, emoji: '🙂', label: 'Добре' },
  { level: 5, emoji: '🤩', label: 'Супер' },
]
