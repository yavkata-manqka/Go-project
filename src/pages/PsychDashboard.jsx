import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, fmtDay, fmtTime, isActiveBooking } from '../store'
import { PSYCHOLOGISTS, psychById } from '../data/psychologists'
import { STATUS } from './Booking'
import { RoleGate, Tabs } from './AdminDashboard'

export default function PsychDashboard() {
  const { state } = useStore()
  const [tab, setTab] = useState('urgent')
  if (state.role !== 'psych') return <RoleGate role="psych" />
  const me = PSYCHOLOGISTS[0]
  const newUrgent = state.urgent.filter((u) => u.status === 'new').length
  const pending = state.bookings.filter((b) => b.status === 'needs-approval').length
  const unread = state.privateChats.reduce((a, c) => a + c.unread, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center gap-3">
        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${me.color}`} aria-hidden>{me.emoji}</span>
        <div>
          <p className="text-sm text-ink/60">Табло на психолога</p>
          <h1 className="text-2xl font-black">{me.name} <span className="chip bg-mint-500 text-white text-xs">Психолог ✓</span></h1>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['urgent', '🚨 Спешни', newUrgent],
          ['bookings', '📅 Часове', pending],
          ['chats', '💬 Лични чатове', unread],
          ['community', '👥 Общност', 0],
        ]}
      />

      {tab === 'urgent' && <Urgent />}
      {tab === 'bookings' && <Bookings />}
      {tab === 'chats' && <Chats />}
      {tab === 'community' && (
        <div className="card mt-4">
          <p className="text-lg font-bold">Като психолог пишеш в общността <b>без одобрение</b>, а съобщенията ти имат значка „Психолог ✓“.</p>
          <Link to="/community" className="btn-grape mt-4">👥 Към общността</Link>
        </div>
      )}
    </div>
  )
}

function Urgent() {
  const { state, update } = useStore()
  const list = [...state.urgent].sort((a, b) => (a.status === 'new' ? -1 : 1) - (b.status === 'new' ? -1 : 1) || new Date(b.ts) - new Date(a.ts))
  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-ink/60">Тук идват съобщения с кризисни думи от всеки чат. Ученикът вече е видял 116 111 и 112. Свържи се възможно най-бързо.</p>
      {list.length === 0 && <p className="card">Няма спешни случаи. 🌤️</p>}
      {list.map((u) => (
        <div key={u.id} className={`card !p-4 border-l-8 ${u.status === 'new' ? 'border-coral-500' : 'border-mint-400 opacity-75'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {u.status === 'new' ? <span className="chip bg-coral-500 text-white animate-pulse">🚨 СПЕШНО</span> : <span className="chip bg-mint-100 text-mint-700">✓ Поет от {u.handledBy}</span>}
            <span className="font-extrabold">{u.who}</span>
            <span className="text-sm text-ink/50">· {u.where} · {fmtDay(u.ts)} {fmtTime(u.ts)}</span>
          </div>
          <p className="mt-2 rounded-2xl bg-cream p-3 italic">„{u.text}“</p>
          {u.status === 'new' && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button onClick={() => update((s) => Object.assign(s.urgent.find((x) => x.id === u.id), { status: 'handled', handledBy: PSYCHOLOGISTS[0].name }))} className="btn-primary">🙋 Поемам случая</button>
              <span className="text-xs text-ink/50 self-center">В реалния продукт тук ще има протокол: личен чат, обаждане, уведомяване при опасност.</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Bookings() {
  const { state, now, update } = useStore()
  const upcoming = state.bookings.filter((b) => b.start && (isActiveBooking(b, now) || ['missed', 'done'].includes(b.status))).sort((a, b) => new Date(a.start) - new Date(b.start))
  const set = (b, status) =>
    update((s) => {
      s.bookings.find((x) => x.id === b.id).status = status
      if (status === 'missed' && b.owner === 'me' && s.student) s.student.noShows += 1
    })

  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-ink/60">Правило: след 2 пропуснати часа без отмяна, следващото запазване чака твое одобрение.</p>
      {upcoming.map((b) => {
        const p = psychById(b.psychId)
        return (
          <div key={b.id} className="card !p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold">{b.nickname}</span>
              {b.owner === 'me' && <span className="chip bg-grape-100 text-grape-700 text-xs">демо ученик · {state.student?.noShows ?? 0} пропуснати</span>}
              <span className={`chip text-xs ${STATUS[b.status].color}`}>{STATUS[b.status].label.replace(' от теб', ' от ученика').replace(' от психолога', ' от теб')}</span>
            </div>
            <p className="text-sm text-ink/60 mt-1">
              {p.emoji} {p.name} · {fmtDay(b.start)} {fmtTime(b.start)} · {b.mode === 'chat' ? '💬 онлайн' : '🏫 на живо'}
            </p>
            {b.note && <p className="text-xs text-sky-700 mt-1">ℹ️ {b.note}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {b.status === 'needs-approval' && (
                <>
                  <button onClick={() => set(b, 'booked')} className="chip bg-mint-500 text-white min-h-[40px] !px-4">✓ Одобри</button>
                  <button onClick={() => set(b, 'cancelled')} className="chip bg-gray-200 min-h-[40px] !px-4">✕ Откажи</button>
                </>
              )}
              {['booked', 'confirmed'].includes(b.status) && (
                <>
                  <button onClick={() => set(b, 'done')} className="chip bg-grape-100 text-grape-700 min-h-[40px] !px-4">🎉 Проведен</button>
                  <button onClick={() => set(b, 'missed')} className="chip bg-coral-100 text-coral-700 min-h-[40px] !px-4">🚫 Не се яви (демо)</button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Chats() {
  const { state, update } = useStore()
  const [open, setOpen] = useState(null)
  const [text, setText] = useState('')
  const chat = state.privateChats.find((c) => c.id === open)

  if (chat) {
    const send = (e) => {
      e.preventDefault()
      if (!text.trim()) return
      update((s) => s.privateChats.find((c) => c.id === open).messages.push({ from: 'psych', text: text.trim(), ts: new Date().toISOString() }))
      setText('')
    }
    return (
      <div className="mt-4">
        <button onClick={() => setOpen(null)} className="text-sm font-bold text-grape-600 min-h-[44px]">← Всички чатове</button>
        <div className="card">
          <p className="font-extrabold text-lg">{chat.avatar} {chat.with}</p>
          <div className="mt-3 flex flex-col gap-2">
            {chat.messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-3xl px-4 py-2 ${m.from === 'psych' ? 'self-end bg-mint-500 text-white rounded-br-md' : 'self-start bg-cream rounded-bl-md'}`}>
                {m.text}
                <span className="block text-[10px] opacity-60">{fmtTime(m.ts)}</span>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="mt-4 flex gap-2">
            <label htmlFor="reply" className="sr-only">Отговор</label>
            <input id="reply" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Отговори…" />
            <button className="btn-mint shrink-0 !px-4" aria-label="Изпрати">➤</button>
          </form>
          <p className="text-xs text-ink/50 mt-2">🧪 Демо: учениците в тези чатове са измислени.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-3">
      {state.privateChats.map((c) => {
        const last = c.messages[c.messages.length - 1]
        return (
          <button
            key={c.id}
            onClick={() => {
              setOpen(c.id)
              update((s) => (s.privateChats.find((x) => x.id === c.id).unread = 0))
            }}
            className="card !p-4 flex items-center gap-3 text-left hover:-translate-y-0.5 transition"
          >
            <span className="w-12 h-12 rounded-2xl bg-grape-100 flex items-center justify-center text-2xl" aria-hidden>{c.avatar}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">{c.with}</span>
              <span className="block text-sm text-ink/60 truncate">{last.text}</span>
            </span>
            {c.unread > 0 && <span className="chip bg-coral-500 text-white">{c.unread}</span>}
          </button>
        )
      })}
    </div>
  )
}
