import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, fmtTime, fmtDay, dateKey } from '../store'
import { hasCrisis } from '../data/crisis'
import { PSYCHOLOGISTS } from '../data/psychologists'

const REASONS = ['Обидно', 'Спам', 'Притеснява ме', 'Някой е в опасност']

export default function Community() {
  const { state, update, openCrisis, flagUrgent } = useStore()
  const [text, setText] = useState('')
  const [note, setNote] = useState(null)
  const role = state.role
  const me = state.student
  const psych = PSYCHOLOGISTS[0] // в демото психологът е Елена

  const visible = state.community
    .filter((m) => m.status === 'approved' || (m.status === 'pending' && (m.mine ? role === 'student' : role === 'admin')))
    .sort((a, b) => new Date(a.ts) - new Date(b.ts))

  const post = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    if (role === 'psych') {
      update((s) => s.community.push({ id: 'c' + Date.now(), author: psych.name, avatar: psych.emoji, kind: 'psych', text: t, status: 'approved', ts: new Date().toISOString(), reports: 0 }))
      setNote({ type: 'ok', text: '✅ Публикувано веднага (психолозите не чакат одобрение).' })
      return
    }
    if (hasCrisis(t)) {
      // НЕ отива в опашката: веднага кризисен екран + спешен сигнал
      flagUrgent(me.nickname, 'Общност', t)
      openCrisis()
      setNote({ type: 'crisis', text: '💜 Съобщението ти не е публикувано публично, но психолог го получи спешно и ще ти пише лично.' })
      return
    }
    update((s) => {
      s.community.push({ id: 'c' + Date.now(), author: me.nickname, avatar: me.avatar, kind: 'student', text: t, status: 'pending', mine: true, ts: new Date().toISOString(), reports: 0 })
      if (!s.student.badges.includes('community')) s.student.badges.push('community')
    })
    setNote({ type: 'wait', text: '⏳ Изпратено! Модератор ще го провери до няколко минути.' })
  }

  let lastDay = ''
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="h-title">👥 Общност</h1>
      <p className="mt-1 text-ink/70">Място за подкрепа. Всяко съобщение от ученик се проверява, преди да се появи.</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="chip bg-mint-100 text-mint-700">🛡️ Модерирано</span>
        <span className="chip bg-grape-100 text-grape-700">🎭 Само прякори</span>
        <span className="chip bg-coral-100 text-coral-700">🚩 Докладвай, ако нещо не е наред</span>
      </div>

      <div className="mt-5 grid gap-3">
        {visible.map((m) => {
          const day = dateKey(m.ts)
          const sep = day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {sep && <p className="text-center text-xs font-bold text-ink/40 my-2">{fmtDay(m.ts)}</p>}
              <Message m={m} />
            </div>
          )
        })}
      </div>

      {note && (
        <div className={`mt-4 rounded-2xl p-3 font-bold text-sm animate-fadeUp ${note.type === 'crisis' ? 'bg-grape-100 text-grape-800' : note.type === 'ok' ? 'bg-mint-100 text-mint-700' : 'bg-yellow-100 text-yellow-800'}`} role="status">
          {note.text}
        </div>
      )}

      <div className="sticky bottom-[72px] mt-4 bg-cream pt-2 pb-1">
        {role === 'guest' || (role === 'student' && !me) ? (
          <div className="card !p-4 text-center">
            <p className="font-bold">За да пишеш в общността, ти трябва училищен код.</p>
            <Link to="/register" className="btn-grape mt-2">🎟️ Регистрирай се</Link>
          </div>
        ) : role === 'admin' ? (
          <div className="card !p-4 text-center text-sm">
            🛠️ Като админ одобряваш съобщенията в <Link to="/admin" className="underline font-bold">таблото</Link> или директно тук.
          </div>
        ) : (
          <form onSubmit={post} className="flex gap-2">
            <label htmlFor="post" className="sr-only">Съобщение</label>
            <input
              id="post"
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={role === 'psych' ? `Пиши като ${psych.name} (Психолог ✓)` : `Пиши като ${me.nickname}…`}
              autoComplete="off"
            />
            <button className="btn-grape shrink-0 !px-4" aria-label="Изпрати">➤</button>
          </form>
        )}
      </div>
    </div>
  )
}

function Message({ m }) {
  const { state, update, flagUrgent } = useStore()
  const [menu, setMenu] = useState(false)
  const [reported, setReported] = useState(false)
  const isPsych = m.kind === 'psych'
  const role = state.role

  const report = (reason) => {
    const by = role === 'student' ? state.student.nickname : role === 'psych' ? 'Психолог' : 'Гост'
    update((s) => {
      s.reports.unshift({ id: 'r' + Date.now(), msgId: m.id, by, reason, ts: new Date().toISOString() })
      s.community.find((x) => x.id === m.id).reports += 1
    })
    if (reason === 'Някой е в опасност') flagUrgent(m.author, 'Общност (доклад)', m.text)
    setMenu(false)
    setReported(true)
  }

  const moderate = (status) => update((s) => (s.community.find((x) => x.id === m.id).status = status))

  return (
    <div className={`flex gap-3 animate-fadeUp ${m.mine ? 'flex-row-reverse' : ''}`}>
      <span className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${isPsych ? 'bg-mint-100' : 'bg-grape-100'}`} aria-hidden>{m.avatar}</span>
      <div className={`max-w-[80%] ${m.mine ? 'items-end text-right' : ''} flex flex-col`}>
        <p className="text-sm font-extrabold flex items-center gap-1 flex-wrap">
          {m.author}
          {isPsych && <span className="chip bg-mint-500 text-white !py-0 !px-2 text-xs">Психолог ✓</span>}
          <span className="font-normal text-ink/40 text-xs">{fmtTime(m.ts)}</span>
        </p>
        <div className={`mt-1 rounded-3xl px-4 py-2.5 text-left ${m.mine ? 'bg-grape-600 text-white rounded-tr-md' : isPsych ? 'bg-mint-50 border-2 border-mint-200 rounded-tl-md' : 'bg-white shadow-sm rounded-tl-md'} ${m.status === 'pending' ? 'opacity-70' : ''}`}>
          {m.text}
        </div>
        {m.status === 'pending' && <span className="mt-1 chip bg-yellow-100 text-yellow-800 text-xs self-start">⏳ Чака одобрение</span>}
        {role === 'admin' && m.status === 'pending' && (
          <div className="mt-1 flex gap-2">
            <button onClick={() => moderate('approved')} className="chip bg-mint-500 text-white min-h-[36px]">✓ Одобри</button>
            <button onClick={() => moderate('rejected')} className="chip bg-coral-500 text-white min-h-[36px]">✕ Отхвърли</button>
          </div>
        )}
        {!m.mine && m.status === 'approved' && role !== 'admin' && (
          <div className="mt-1">
            {reported ? (
              <span className="text-xs text-ink/50">🚩 Благодарим! Модератор ще провери.</span>
            ) : menu ? (
              <div className="flex flex-wrap gap-1">
                {REASONS.map((r) => (
                  <button key={r} onClick={() => report(r)} className="chip bg-coral-50 text-coral-700 border border-coral-200 text-xs min-h-[36px]">{r}</button>
                ))}
                <button onClick={() => setMenu(false)} className="chip text-xs text-ink/50 min-h-[36px]">Отказ</button>
              </div>
            ) : (
              <button onClick={() => setMenu(true)} className="text-xs text-ink/40 hover:text-coral-600 min-h-[32px]">🚩 Докладвай</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
