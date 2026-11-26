import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useStore, dateKey, addDays, daysBetween, weekKey, MOODS, isActiveBooking } from '../store'
import Mascot, { mascotStage } from '../components/Mascot'
import { BADGES } from '../data/badges'
import { missionsForDay } from '../data/missions'
import { quizOfDay } from '../data/articles'
import { quoteOfDay } from '../data/quotes'

export default function AppHome() {
  const { state } = useStore()
  if (state.role === 'psych') return <Navigate to="/psych" replace />
  if (state.role === 'admin') return <Navigate to="/admin" replace />
  if (state.role === 'student' && state.student) return <StudentHome />
  return <GuestHome />
}

// ---------------- ГОСТ (ниво 0) ----------------
function GuestHome() {
  return (
    <div className="page">
      <div className="flex items-center gap-4">
        <Mascot mood={5} streak={0} size={110} />
        <div>
          <h1 className="text-3xl font-black leading-tight">Хей! 👋</h1>
          <p className="text-ink/70 text-lg">Без регистрация и без родители. Избери откъде да започнеш.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        <BigCard to="/chat" emoji="💬" title="Пиши на психолог" text="Веднага. Анонимно, ако искаш. Нищо не се запазва." color="bg-gradient-to-r from-coral-400 to-coral-500 text-white" />
        <a href="tel:116111" className="rounded-4xl p-5 flex items-center gap-4 shadow-sm transition hover:scale-[1.02] bg-grape-100">
          <span className="text-5xl" aria-hidden>📞</span>
          <span>
            <span className="block text-xl font-black leading-tight">Предпочиташ да говориш?</span>
            <span className="text-sm opacity-80">Звънни на 116 111: безплатно, 24/7, отговарят психолози</span>
          </span>
        </a>
        <BigCard to="/help" emoji="📚" title="Кратки съвети" text="Приятели, семейство, тормоз, стрес, любов, самочувствие" color="bg-mint-100" />
        <BigCard to="/quiz" emoji="🧩" title="Тестове за себе си" text="6 теста по 5 въпроса → резултат и съвет" color="bg-yellow-100" />
      </div>
      <QuoteCard />
      <div className="card mt-6 bg-gradient-to-br from-grape-600 to-grape-800 text-white">
        <p className="chip bg-white/20">Ниво 1</p>
        <h2 className="mt-2 text-2xl font-black">Имаш училищен код? 🎟️</h2>
        <p className="mt-1 text-white/85">Отключи Готи, ежедневен Vibe Check, мини мисии, 🔥 серия, значки и общността.</p>
        <Link to="/register" className="btn bg-white text-grape-700 mt-4 w-full sm:w-auto">Регистрирай се с код</Link>
      </div>
    </div>
  )
}

function BigCard({ to, emoji, title, text, color }) {
  return (
    <Link to={to} className={`rounded-4xl p-5 flex items-center gap-4 shadow-sm transition hover:scale-[1.02] ${color}`}>
      <span className="text-5xl" aria-hidden>{emoji}</span>
      <span>
        <span className="block text-xl font-black leading-tight">{title}</span>
        <span className="text-sm opacity-80">{text}</span>
      </span>
    </Link>
  )
}

// ---------------- УЧЕНИК (ниво 1) ----------------
const MASCOT_TALK = {
  0: 'Как си днес? Готи пита 👀',
  1: 'Готи е до теб. Днес може просто да си почиваш. 💜',
  2: 'Тежък ден, а? Готи ти праща виртуална прегръдка 🫂',
  3: 'Горе-долу е напълно ОК. Една малка мисия?',
  4: 'Ура, добър ден! Готи танцува 🕺',
  5: 'СУПЕР! Готи свети от радост ✨',
}

function StudentHome() {
  const { state, now, update, nextDay } = useStore()
  const st = state.student
  const today = dateKey(now)
  const todayMood = st.moodHistory.find((m) => m.date === today)?.level
  const freezesLeft = 2 - (st.freezeWeek === weekKey(now) ? st.freezesUsed : 0)
  const missions = missionsForDay(today)
  const done = st.missionsDone[today] || []
  const allDone = missions.every((m) => done.includes(m.id))
  const stage = mascotStage(st.streak)
  const nextAt = [1, 7, 14, 30].find((n) => n > st.streak)
  const away = st.lastCheckIn ? daysBetween(st.lastCheckIn, today) : 0
  const activeBookings = state.bookings.filter((b) => b.owner === 'me' && isActiveBooking(b, now))

  // 3 поредни дни с ниско настроение → нежно предложение
  const last3 = [0, 1, 2].map((i) => st.moodHistory.find((m) => m.date === dateKey(addDays(now, -i)))?.level)
  const lowStreak = last3.every((l) => l && l <= 2) && st.lowMoodDismissed !== today

  const checkIn = (level) =>
    update((s) => {
      const u = s.student
      const existing = u.moodHistory.find((m) => m.date === today)
      if (existing) {
        existing.level = level
        return
      }
      u.moodHistory.push({ date: today, level })
      const wk = weekKey(now)
      if (u.freezeWeek !== wk) {
        u.freezeWeek = wk
        u.freezesUsed = 0
      }
      let msg = null
      if (!u.lastCheckIn) {
        u.streak = 1
      } else {
        const gap = daysBetween(u.lastCheckIn, today)
        const missed = gap - 1
        if (missed <= 0) u.streak += 1
        else if (missed <= 2 - u.freezesUsed) {
          u.freezesUsed += missed
          u.streak += 1
          msg = `❄️ Използвахме ${missed === 1 ? 'едно замразяване' : missed + ' замразявания'} и серията ти е наред. Няма проблем, продължаваме заедно.`
        } else {
          u.streak = 1
          msg = '🌱 Започваме нова серия. Няма проблем, продължаваме заедно. Готи се радва, че си тук!'
        }
      }
      u.lastCheckIn = today
      const give = (b) => !u.badges.includes(b) && u.badges.push(b)
      give('first')
      if (u.streak >= 7) give('week')
      if (u.streak >= 30) give('month')
      if ([7, 14, 30].includes(u.streak)) msg = `🎉 ${u.streak} дни поред! Готи порасна!`
      u.lastMessage = msg
    })

  return (
    <div className="page">
      {/* горна лента */}
      <div className="flex items-center gap-3">
        <span className="w-14 h-14 rounded-2xl bg-grape-100 flex items-center justify-center text-3xl" aria-hidden>{st.avatar}</span>
        <div>
          <p className="text-sm text-ink/60">Здрасти,</p>
          <p className="text-xl font-black leading-tight">{st.nickname}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="chip bg-coral-100 text-coral-700 text-lg" title="Дни поред">🔥 {st.streak}</span>
          <span className="chip bg-sky-100 text-sky-700 text-lg" title="Замразявания тази седмица">❄️ {freezesLeft}</span>
        </div>
      </div>

      {/* Готи */}
      <div className="card mt-4 text-center bg-gradient-to-b from-grape-50 to-white">
        <div className="flex justify-center"><Mascot mood={todayMood || 4} streak={st.streak} size={170} /></div>
        <p className="font-extrabold text-lg">{MASCOT_TALK[todayMood || 0]}</p>
        <p className="text-sm text-ink/60 mt-1">
          {stage.name}
          {nextAt && <> · още {nextAt - st.streak} {nextAt - st.streak === 1 ? 'ден' : 'дни'} до следващото ниво 🌱</>}
        </p>
      </div>

      <QuoteCard />

      {away >= 2 && !todayMood && (
        <Notice color="bg-mint-50 border-mint-200">👋 Радваме се да те видим отново! Направи Vibe Check и продължаваме заедно.</Notice>
      )}
      {st.lastMessage && (
        <Notice color="bg-sky-50 border-sky-200" onClose={() => update((s) => (s.student.lastMessage = null))}>{st.lastMessage}</Notice>
      )}

      {lowStreak && (
        <div className="card mt-4 border-2 border-grape-200 animate-pop">
          <p className="text-lg font-extrabold">💜 Изглежда ти е тежко напоследък. Искаш ли да поговориш с някого?</p>
          <p className="text-sm text-ink/60 mt-1">Няма нищо странно в това. Психолозите са тук точно за такива моменти.</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Link to="/chat" className="btn-primary">💬 Пиши на психолог</Link>
            <Link to="/booking" className="btn-ghost">📅 Запази час</Link>
            <button onClick={() => update((s) => (s.student.lowMoodDismissed = today))} className="btn-ghost">Не сега</button>
          </div>
        </div>
      )}

      {/* Vibe Check */}
      <section className="card mt-4">
        <h2 className="text-xl font-black">✨ Vibe Check за днес</h2>
        <p className="text-sm text-ink/60">{todayMood ? 'Благодаря, че сподели! Можеш да го смениш.' : 'Как си днес? Натисни едно.'}</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.level}
              onClick={() => checkIn(m.level)}
              aria-pressed={todayMood === m.level}
              aria-label={m.label}
              className={`rounded-2xl py-3 flex flex-col items-center gap-1 transition border-2 ${todayMood === m.level ? 'border-grape-500 bg-grape-50 scale-110' : 'border-transparent bg-cream hover:scale-105'}`}
            >
              <span className="text-3xl sm:text-4xl" aria-hidden>{m.emoji}</span>
              <span className="text-[11px] sm:text-xs font-bold leading-tight text-center">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Мисии */}
      <section className="card mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">🎯 Мисии за днес</h2>
          <span className="chip bg-mint-100 text-mint-700">{done.length}/{missions.length}</span>
        </div>
        {allDone ? (
          <div className="text-center py-6 animate-pop">
            <span className="text-5xl" aria-hidden>🎉</span>
            <p className="text-2xl font-black mt-2">Готово за днес! Ела утре 👋</p>
            <p className="text-ink/60 mt-1">Остави телефона и прави нещо, което обичаш. Готи ще те чака.</p>
          </div>
        ) : (
          <div className="mt-3 grid gap-2">
            {missions.map((m) => (
              <Mission key={m.id} m={m} done={done.includes(m.id)} today={today} />
            ))}
          </div>
        )}
      </section>

      {/* Настроение */}
      <MoodHistory history={st.moodHistory} now={now} />

      {/* Значки */}
      <section className="card mt-4">
        <h2 className="text-xl font-black">🏅 Значки</h2>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Object.entries(BADGES).map(([id, b]) => {
            const has = st.badges.includes(id)
            return (
              <div key={id} title={b.desc} className={`rounded-2xl p-2 text-center ${has ? (id === 'courage' ? 'bg-gradient-to-b from-yellow-100 to-coral-100' : 'bg-grape-50') : 'bg-gray-50 opacity-50 grayscale'}`}>
                <span className="text-3xl" aria-hidden>{b.emoji}</span>
                <p className="text-xs font-extrabold leading-tight mt-1">{b.name}</p>
                {!has && <p className="text-[10px] text-ink/60 leading-tight">{b.desc}</p>}
              </div>
            )
          })}
        </div>
      </section>

      {/* Бързи връзки */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link to="/booking" className="rounded-3xl p-4 bg-mint-100 font-extrabold hover:scale-[1.02] transition">
          📅 Час при психолог
          <span className="block text-xs font-bold text-ink/60">{activeBookings.length ? `${activeBookings.length} активен/и` : 'Вземи значка „Смелост“ 🦁'}</span>
        </Link>
        <Link to="/community" className="rounded-3xl p-4 bg-coral-100 font-extrabold hover:scale-[1.02] transition">
          👥 Общност
          <span className="block text-xs font-bold text-ink/60">Пиши с прякор</span>
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border-2 border-dashed border-grape-200 p-4 text-sm">
        <p className="font-bold">🧪 Демо инструмент</p>
        <p className="text-ink/60">Виж как изглежда утре: нови мисии, серия, замразяване.</p>
        <button onClick={nextDay} className="btn-ghost mt-2 text-sm">⏩ Превърти 1 ден напред</button>
      </div>
    </div>
  )
}

function QuoteCard() {
  const { now } = useStore()
  return (
    <div className="mt-4 rounded-3xl bg-gradient-to-r from-yellow-50 to-coral-50 border-2 border-yellow-100 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-coral-600">💭 Мисъл на деня</p>
      <p className="mt-1 text-lg font-bold leading-snug">„{quoteOfDay(dateKey(now))}“</p>
    </div>
  )
}

function Notice({ children, color, onClose }) {
  return (
    <div className={`mt-4 rounded-3xl border-2 p-4 flex gap-3 items-start animate-fadeUp ${color}`}>
      <p className="font-bold flex-1">{children}</p>
      {onClose && <button onClick={onClose} className="text-ink/50 min-w-[44px] min-h-[44px] -m-2" aria-label="Затвори">✕</button>}
    </div>
  )
}

const PICTURES = [
  { emoji: '☀️', label: 'Слънчево', reply: 'Хубаво! Запомни какво направи деня ти слънчев. ☀️' },
  { emoji: '⛅', label: 'Облачно', reply: 'Малко облачно е ОК. Не всеки ден трябва да е слънчев.' },
  { emoji: '🌧️', label: 'Дъждовно', reply: 'Дъждовните дни минават. Направи си нещо мило днес. 💜' },
  { emoji: '⛈️', label: 'Буря', reply: 'Звучи бурно. Искаш ли да поговориш с някого? Бутонът е долу вдясно.' },
  { emoji: '🌫️', label: 'Мъгла', reply: 'Когато е мъгливо, е трудно да видиш напред. Една малка стъпка стига.' },
  { emoji: '🌈', label: 'Дъга', reply: 'След дъжд – дъга! Супер е, че ти е по-добре. 🌈' },
]

function Mission({ m, done, today }) {
  const { update } = useStore()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [pic, setPic] = useState(null)

  const complete = () =>
    update((s) => {
      const u = s.student
      u.missionsDone[today] = [...(u.missionsDone[today] || []), m.id]
      if (text.trim()) u.journal.push({ date: today, mission: m.id, text: text.trim() })
      if (m.badge && !u.badges.includes(m.badge)) u.badges.push(m.badge)
    })

  if (done) {
    return (
      <div className="rounded-2xl bg-mint-50 p-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>{m.emoji}</span>
        <span className="font-bold line-through text-ink/50">{m.title}</span>
        <span className="ml-auto text-mint-600 text-2xl animate-pop" aria-label="Готово">✓</span>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border-2 border-grape-100 p-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 text-left min-h-[44px]" aria-expanded={open}>
        <span className="text-2xl" aria-hidden>{m.emoji}</span>
        <span>
          <span className="block font-extrabold">{m.title}</span>
          <span className="text-xs text-ink/50">под 2 мин</span>
        </span>
        <span className="ml-auto text-grape-500 font-black">{open ? '−' : 'Почни'}</span>
      </button>
      {open && (
        <div className="mt-3 animate-fadeUp">
          <p className="text-ink/75">{m.desc}</p>
          {m.type === 'write' && (
            <>
              <label className="sr-only" htmlFor={`m-${m.id}`}>{m.title}</label>
              <textarea id={`m-${m.id}`} value={text} onChange={(e) => setText(e.target.value)} className="input mt-3" rows={2} placeholder={m.placeholder} />
              <button disabled={!text.trim()} onClick={complete} className="btn-mint w-full mt-2">Запази ✓</button>
              <p className="text-[11px] text-ink/50 mt-1">Записва се само в твоя браузър.</p>
            </>
          )}
          {m.type === 'action' && <button onClick={complete} className="btn-mint w-full mt-3">Направих го ✓</button>}
          {m.type === 'breath' && <Breathing onDone={complete} />}
          {m.type === 'quiz' && (() => {
            const q = quizOfDay(today)
            return (
              <button onClick={() => nav(`/quiz/${q.id}?daily=1`)} className={`w-full mt-3 rounded-2xl p-3 flex items-center gap-3 font-extrabold text-left ${q.color}`}>
                <span className="text-3xl" aria-hidden>{q.emoji}</span>
                <span>Днес: „{q.title}“<span className="block text-xs font-bold text-ink/60">Натисни, за да започнеш</span></span>
              </button>
            )
          })()}
          {m.type === 'picture' && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Картинка за деня">
                {PICTURES.map((p) => (
                  <button key={p.label} role="radio" aria-checked={pic === p} onClick={() => setPic(p)} className={`rounded-2xl py-3 flex flex-col items-center transition ${pic === p ? 'bg-grape-100 ring-2 ring-grape-500 scale-105' : 'bg-cream hover:scale-105'}`}>
                    <span className="text-4xl" aria-hidden>{p.emoji}</span>
                    <span className="text-xs font-bold">{p.label}</span>
                  </button>
                ))}
              </div>
              {pic && (
                <div className="animate-fadeUp">
                  <p className="mt-3 rounded-2xl bg-grape-50 p-3 font-bold">{pic.reply}</p>
                  <button onClick={complete} className="btn-mint w-full mt-2">Готово ✓</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Анимирано дишане 4-4-4, три цикъла
const PHASES = [
  { label: 'Вдишай', scale: 1 },
  { label: 'Задръж', scale: 1 },
  { label: 'Издишай', scale: 0.5 },
]
function Breathing({ onDone }) {
  const [step, setStep] = useState(-1)
  const [sec, setSec] = useState(4)
  const total = 9
  useEffect(() => {
    if (step < 0 || step >= total) return
    setSec(4)
    const tick = setInterval(() => setSec((s) => Math.max(1, s - 1)), 1000)
    const t = setTimeout(() => setStep((s) => s + 1), 4000)
    return () => {
      clearTimeout(t)
      clearInterval(tick)
    }
  }, [step])

  if (step >= total) {
    return (
      <div className="text-center mt-3">
        <p className="text-lg font-extrabold">Браво! Как се чувстваш? 🌬️</p>
        <button onClick={onDone} className="btn-mint w-full mt-2">Готово ✓</button>
      </div>
    )
  }
  const ph = step < 0 ? { label: 'Готов/а ли си?', scale: 0.5 } : PHASES[step % 3]
  return (
    <div className="flex flex-col items-center mt-3">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-mint-200 to-grape-200"
          style={{ transform: `scale(${ph.scale})`, transition: step < 0 ? 'none' : 'transform 4s ease-in-out' }}
        />
        <div className="relative text-center">
          <p className="text-xl font-black">{ph.label}</p>
          {step >= 0 && <p className="text-3xl font-black text-grape-700" aria-live="polite">{sec}</p>}
        </div>
      </div>
      {step < 0 ? (
        <button onClick={() => setStep(0)} className="btn-grape mt-3">▶ Започни</button>
      ) : (
        <p className="text-sm text-ink/60 mt-2">Цикъл {Math.floor(step / 3) + 1} от 3</p>
      )}
    </div>
  )
}

function MoodHistory({ history, now }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(now, -(13 - i))
    const k = dateKey(d)
    return { k, d, level: history.find((m) => m.date === k)?.level }
  })
  return (
    <section className="card mt-4">
      <h2 className="text-xl font-black">📈 Настроението ти (14 дни)</h2>
      <div className="mt-4 flex items-end gap-1 h-32" role="img" aria-label="Графика на настроението за последните 14 дни">
        {days.map((x) => (
          <div key={x.k} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            {x.level ? (
              <>
                <span className="text-sm" aria-hidden>{MOODS[x.level - 1].emoji}</span>
                <div
                  className={`w-full rounded-t-lg ${x.level >= 4 ? 'bg-mint-300' : x.level === 3 ? 'bg-yellow-200' : 'bg-grape-200'}`}
                  style={{ height: `${x.level * 16}%` }}
                />
              </>
            ) : (
              <div className="w-full h-1 rounded bg-gray-100" />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-ink/50 mt-1">
        <span>преди 2 седмици</span>
        <span>днес</span>
      </div>
    </section>
  )
}
