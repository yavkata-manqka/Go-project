import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, generateSlots, fmtDay, fmtTime, dateKey, isActiveBooking, CONFIRM_DEADLINE } from '../store'
import { PSYCHOLOGISTS, psychById } from '../data/psychologists'
import Mascot from '../components/Mascot'

const H24 = 24 * 60 * 60 * 1000
export const STATUS = {
  booked: { label: 'Чака потвърждение от теб', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Потвърден ✓', color: 'bg-mint-100 text-mint-700' },
  'needs-approval': { label: 'Чака одобрение от психолога', color: 'bg-sky-100 text-sky-700' },
  released: { label: 'Освободен (не беше потвърден)', color: 'bg-gray-100 text-ink/60' },
  cancelled: { label: 'Отменен', color: 'bg-gray-100 text-ink/60' },
  missed: { label: 'Пропуснат', color: 'bg-coral-100 text-coral-700' },
  done: { label: 'Проведен 🎉', color: 'bg-grape-100 text-grape-700' },
}

export default function Booking() {
  const { state, now, update } = useStore()
  const st = state.student
  const [psychId, setPsychId] = useState(null)
  const [mode, setMode] = useState('chat')
  const [pick, setPick] = useState(null)
  const [celebrate, setCelebrate] = useState(false)
  const slots = useMemo(() => generateSlots(now), [now])

  if (state.role !== 'student' || !st) {
    return (
      <div className="page text-center">
        <Mascot mood={4} streak={7} size={120} className="mx-auto" />
        <h1 className="h-title mt-3">📅 Час при психолог</h1>
        <p className="mt-2 text-ink/70">Това е ниво 2. За да си запазиш час, ти трябва регистрация с училищен код.</p>
        <div className="mt-5 grid gap-2">
          <Link to="/register" className="btn-grape">🎟️ Регистрирай се</Link>
          <Link to="/chat" className="btn-ghost">💬 Или пиши анонимно сега</Link>
        </div>
      </div>
    )
  }

  const mine = state.bookings.filter((b) => b.owner === 'me').sort((a, b) => new Date(b.start) - new Date(a.start))
  const active = mine.filter((b) => isActiveBooking(b, now))
  const takenIds = new Set(state.bookings.filter((b) => ['booked', 'confirmed', 'needs-approval'].includes(b.status)).map((b) => b.slotId))
  const needsApproval = st.noShows >= 2

  const book = () => {
    const firstTime = !st.badges.includes('courage')
    update((s) => {
      s.bookings.push({
        id: 'b' + Date.now(),
        owner: 'me',
        nickname: s.student.nickname,
        psychId: pick.psychId,
        slotId: pick.id,
        start: pick.start,
        mode,
        status: needsApproval ? 'needs-approval' : 'booked',
        createdAt: new Date().toISOString(),
        note: needsApproval ? 'Има 2 пропуснати сесии' : undefined,
      })
      if (!s.student.badges.includes('courage')) s.student.badges.push('courage')
    })
    setPick(null)
    setPsychId(null)
    if (firstTime) setCelebrate(true)
  }

  const setStatus = (id, status) => update((s) => (s.bookings.find((b) => b.id === id).status = status))

  return (
    <div className="page">
      <h1 className="h-title">📅 Час при психолог</h1>
      <p className="mt-1 text-ink/70">Онлайн чат или на живо в училище. Да поискаш помощ е смело. 🦁</p>

      {!st.consentLevel2 ? (
        <div className="card mt-5 border-2 border-grape-200">
          <h2 className="text-xl font-black">👨‍👩‍👧 Нужно е съгласие от родител</h2>
          <p className="mt-2 text-ink/75">За редовни сесии с психолог (ниво 2) е нужно съгласие от родител. Родителят получава само информация какво е GotU, но не и за какво говориш.</p>
          <button onClick={() => update((s) => (s.student.consentLevel2 = true))} className="btn-grape w-full mt-4">📩 Изпрати молба и симулирай „Да“ (демо)</button>
          <p className="text-xs text-ink/50 mt-3">Дотогава винаги можеш да <Link to="/chat" className="underline">пишеш анонимно</Link>.</p>
        </div>
      ) : (
        <>
          {/* Моите часове */}
          <section className="mt-5">
            <h2 className="text-xl font-black">Моите часове <span className="text-ink/40 text-base">({active.length}/2 активни)</span></h2>
            {mine.length === 0 && <p className="text-ink/60 mt-2">Още нямаш запазени часове.</p>}
            <div className="mt-3 grid gap-3">
              {mine.map((b) => {
                const p = psychById(b.psychId)
                const ms = new Date(b.start) - now
                const canConfirm = b.status === 'booked' && ms < H24 && ms > CONFIRM_DEADLINE
                return (
                  <div key={b.id} className="card !p-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${p.color}`} aria-hidden>{p.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-extrabold">{p.name}</p>
                        <p className="text-sm text-ink/60">{fmtDay(b.start)} · {fmtTime(b.start)} · {b.mode === 'chat' ? '💬 онлайн' : '🏫 на живо'}</p>
                      </div>
                    </div>
                    <span className={`chip mt-3 text-xs ${STATUS[b.status].color}`}>{STATUS[b.status].label}</span>
                    {b.status === 'booked' && !canConfirm && ms >= H24 && (
                      <p className="text-xs text-ink/50 mt-2">⏰ Бутонът „Потвърди“ ще се появи 24 ч преди часа. Ако не потвърдиш до 2 ч преди началото, часът се освобождава за друг.</p>
                    )}
                    {canConfirm && (
                      <div className="mt-3 rounded-2xl bg-yellow-50 p-3">
                        <p className="text-sm font-bold">⏰ Часът ти е до 24 ч. Ще дойдеш ли?</p>
                        <button onClick={() => setStatus(b.id, 'confirmed')} className="btn-mint w-full mt-2">✓ Потвърди</button>
                      </div>
                    )}
                    {isActiveBooking(b, now) && (
                      <button onClick={() => confirm('Да отменя ли часа? Така друг ученик ще може да го вземе.') && setStatus(b.id, 'cancelled')} className="mt-2 text-sm font-bold text-ink/50 underline min-h-[44px]">
                        Отмени часа
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {needsApproval && (
            <p className="mt-4 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-sm">
              ℹ️ Имаш 2 пропуснати часа без отмяна, затова следващият ще бъде потвърден от психолога. Няма страшно, просто
              пази часа за друг, ако не можеш да дойдеш. 💜
            </p>
          )}

          {/* Нов час */}
          <section className="mt-8">
            <h2 className="text-xl font-black">Запази нов час</h2>
            {active.length >= 2 ? (
              <p className="mt-2 rounded-2xl bg-grape-50 p-4">✋ Можеш да имаш до <b>2 активни часа</b> едновременно, за да има място за всички. Отмени един или изчакай да мине.</p>
            ) : (
              <>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {PSYCHOLOGISTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPsychId(psychId === p.id ? null : p.id)}
                      aria-pressed={psychId === p.id}
                      className={`card !p-4 text-left transition ${psychId === p.id ? 'ring-4 ring-grape-400' : 'hover:-translate-y-0.5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${p.color}`} aria-hidden>{p.emoji}</span>
                        <div>
                          <p className="font-extrabold leading-tight">{p.name}</p>
                          <p className="text-xs text-ink/50">{p.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-ink/70 mt-2">{p.bio}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.topics.map((t) => <span key={t} className="chip bg-cream text-xs">{t}</span>)}
                      </div>
                    </button>
                  ))}
                </div>

                {psychId && (
                  <div className="card mt-4 animate-fadeUp">
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Вид среща">
                      {[['chat', '💬 Онлайн чат'], ['live', '🏫 На живо']].map(([k, l]) => (
                        <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className={`btn ${mode === k ? 'bg-grape-600 text-white' : 'bg-cream'}`}>{l}</button>
                      ))}
                    </div>
                    <SlotGrid slots={slots.filter((s) => s.psychId === psychId)} takenIds={takenIds} onPick={setPick} />
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}

      {pick && (
        <Modal onClose={() => setPick(null)}>
          <h2 className="text-2xl font-black">Потвърди часа</h2>
          <p className="mt-2 text-lg">
            {psychById(pick.psychId).emoji} <b>{psychById(pick.psychId).name}</b>
            <br />
            {fmtDay(pick.start)} в {fmtTime(pick.start)} · {mode === 'chat' ? '💬 онлайн чат' : '🏫 на живо'}
          </p>
          {needsApproval && <p className="mt-2 text-sm text-sky-700">ℹ️ Този час ще чака одобрение от психолога.</p>}
          <p className="mt-2 text-sm text-ink/60">24 ч преди часа ще трябва да натиснеш „Потвърди“.</p>
          <div className="mt-5 grid gap-2">
            <button onClick={book} className="btn-primary">📅 Запази</button>
            <button onClick={() => setPick(null)} className="btn-ghost">Назад</button>
          </div>
        </Modal>
      )}

      {celebrate && (
        <Modal onClose={() => setCelebrate(false)}>
          <div className="text-center">
            <div className="text-7xl animate-pop" aria-hidden>🦁</div>
            <h2 className="text-3xl font-black mt-2">Значка „Смелост“!</h2>
            <p className="mt-2 text-lg">Да поискаш помощ е едно от най-смелите неща. Гордеем се с теб! 💜</p>
            <div className="flex justify-center mt-2"><Mascot mood={5} streak={st.streak} size={120} /></div>
            <button onClick={() => setCelebrate(false)} className="btn-grape w-full mt-3">Супер!</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function SlotGrid({ slots, takenIds, onPick }) {
  const byDay = {}
  slots.forEach((s) => (byDay[dateKey(s.start)] ||= []).push(s))
  return (
    <div className="mt-4 grid gap-3">
      {Object.entries(byDay).map(([d, list]) => (
        <div key={d}>
          <p className="text-sm font-extrabold text-ink/60">{fmtDay(list[0].start)}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {list.map((s) => {
              const taken = s.takenByOther || takenIds.has(s.id)
              return (
                <button key={s.id} disabled={taken} onClick={() => onPick(s)} className={`rounded-2xl px-4 min-h-[44px] font-extrabold transition ${taken ? 'bg-gray-100 text-ink/30 line-through' : 'bg-mint-100 text-mint-700 hover:bg-mint-200 hover:scale-105'}`}>
                  {fmtTime(s.start)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-ink/50">🟩 свободен · <span className="line-through">зачеркнат</span> = зает</p>
    </div>
  )
}

export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full sm:max-w-md bg-white rounded-t-4xl sm:rounded-4xl p-6 animate-fadeUp" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
