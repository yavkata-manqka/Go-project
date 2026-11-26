import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_REPLIES, PSYCHOLOGISTS } from '../data/psychologists'
import { hasCrisis } from '../data/crisis'
import { useStore } from '../store'
import Mascot from '../components/Mascot'

const TOPICS = ['😰 Стрес', '👯 Приятели', '🏠 Вкъщи', '🛡️ Тормоз', '💘 Любов', '🤷 Не знам']

const CRISIS_REPLY =
  'Чух те и се радвам, че ми писа. 💜 Това, което споделяш, е много важно. Изпратих спешен сигнал до дежурен психолог. Ако си в опасност точно сега, моля, обади се на 112. Можеш и на 116 111, безплатно е и има кой да те чуе денонощно. Тук съм.'

// Анонимен чат. Нищо НЕ се запазва – всичко живее само докато страницата е отворена.
export default function Chat() {
  const { state, openCrisis, flagUrgent } = useStore()
  const [phase, setPhase] = useState('intro')
  const [psych, setPsych] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [replyIdx, setReplyIdx] = useState(0)
  const endRef = useRef(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  const who = state.role === 'student' ? state.student.nickname : 'Анонимен гост'

  const start = (topic) => {
    setPhase('connecting')
    const p = PSYCHOLOGISTS[Math.floor(Math.random() * PSYCHOLOGISTS.length)]
    later(() => {
      setPsych(p)
      setPhase('chat')
      setMsgs([
        { from: 'psych', text: `Здрасти! Аз съм ${p.name.split(' ')[0]}, психолог в GotU. Тук си напълно анонимен/на и можеш да пишеш каквото искаш.${topic ? ` Виждам, че си избрал/а „${topic.slice(3)}“.` : ''} Какво ти е на ума днес?` },
      ])
    }, 1600)
  }

  const send = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    const crisis = hasCrisis(t)
    setMsgs((m) => [...m, { from: 'me', text: t, crisis }])
    if (crisis) {
      flagUrgent(who, 'Анонимен чат', t)
      openCrisis()
    }
    setTyping(true)
    later(() => {
      setTyping(false)
      const reply = crisis ? CRISIS_REPLY : DEMO_REPLIES[Math.min(replyIdx, DEMO_REPLIES.length - 1)]
      if (!crisis) setReplyIdx((i) => i + 1)
      setMsgs((m) => [...m, { from: 'psych', text: reply }])
    }, crisis ? 900 : 1500 + Math.random() * 1000)
  }

  const close = () => {
    timers.current.forEach(clearTimeout)
    setMsgs([])
    setPsych(null)
    setReplyIdx(0)
    setTyping(false)
    setPhase('closed')
  }

  if (phase === 'intro' || phase === 'closed') {
    return (
      <div className="page text-center">
        <div className="flex justify-center"><Mascot mood={phase === 'closed' ? 4 : 5} streak={14} size={140} /></div>
        {phase === 'closed' ? (
          <>
            <h1 className="h-title mt-3">Разговорът е изтрит 🧹</h1>
            <p className="mt-2 text-lg text-ink/70">Нищо не е запазено. Можеш да се върнеш, когато поискаш.</p>
          </>
        ) : (
          <>
            <h1 className="h-title mt-3">Пиши на психолог</h1>
            <p className="mt-2 text-lg text-ink/70">Без регистрация. Без родители. Анонимно, ако искаш.<br />Когато затвориш, разговорът изчезва.</p>
          </>
        )}
        <div className="card mt-6 text-left">
          <p className="font-extrabold">За какво искаш да поговорим? <span className="font-normal text-ink/60">(по желание)</span></p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => start(t)} className="chip bg-grape-50 text-grape-700 border-2 border-grape-100 hover:border-grape-400 min-h-[44px] !px-4 text-base">
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => start(null)} className="btn-primary w-full mt-5 text-lg">💬 Започни чат</button>
        </div>
        <a href="tel:116111" className="card mt-3 flex items-center gap-4 text-left bg-grape-50 hover:bg-grape-100 transition">
          <span className="text-4xl" aria-hidden>📞</span>
          <span>
            <span className="block font-extrabold text-lg">Предпочиташ да говориш?</span>
            <span className="text-sm text-ink/70">Звънни на <b>116 111</b>: безплатно, 24/7, отговарят психолози.</span>
          </span>
        </a>
        <ul className="mt-6 grid gap-2 text-left text-sm text-ink/70">
          <li>🙈 Не питаме за име, телефон или училище.</li>
          <li>🧑‍⚕️ Отговарят психолози, не бот.</li>
          <li>🧪 <b>В демото</b> отговорите са предварително написани и са отбелязани като демо.</li>
          <li>📞 Ако ти е много тежко сега: <a className="font-bold text-grape-700 underline" href="tel:116111">116 111</a> или <a className="font-bold text-coral-600 underline" href="tel:112">112</a>.</li>
        </ul>
      </div>
    )
  }

  if (phase === 'connecting') {
    return (
      <div className="page text-center py-20">
        <div className="flex justify-center"><Mascot mood={4} streak={14} size={140} /></div>
        <p className="mt-4 text-xl font-extrabold">Свързваме те с психолог…</p>
        <div className="mt-4 flex justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => <span key={i} className="w-3 h-3 rounded-full bg-grape-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-6 flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="card !p-3 flex items-center gap-3 sticky top-[68px] z-10">
        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${psych.color}`} aria-hidden>{psych.emoji}</span>
        <div className="min-w-0">
          <p className="font-extrabold leading-tight">{psych.name} <span className="chip bg-mint-100 text-mint-700 !py-0 !px-2 text-xs">Психолог ✓</span></p>
          <p className="text-xs text-ink/60">🔒 Анонимен чат · демо профил</p>
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          <a href="tel:116111" className="btn-ghost !min-h-[44px] !px-3 text-sm" aria-label="Звънни на 116 111">📞</a>
          <button onClick={close} className="btn-ghost !min-h-[44px] !px-3 text-sm">🧹 Затвори</button>
        </div>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-3" aria-live="polite">
        {msgs.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
        {typing && (
          <div className="self-start bg-white rounded-3xl rounded-bl-md px-4 py-3 shadow-sm flex gap-1.5" aria-label="Психологът пише">
            {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-grape-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-[72px] bg-cream pt-2 flex gap-2">
        <label htmlFor="chat-input" className="sr-only">Съобщение</label>
        <input id="chat-input" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши каквото ти е на сърцето…" autoComplete="off" />
        <button className="btn-grape shrink-0 !px-4" aria-label="Изпрати">➤</button>
      </form>
      <p className="text-center text-xs text-ink/50 mt-2">
        Не е спешно? Можеш и да <Link to="/help" className="underline">прочетеш съвети</Link>.
      </p>
    </div>
  )
}

function Bubble({ m }) {
  if (m.from === 'me') {
    return (
      <div className="self-end max-w-[85%] animate-fadeUp">
        <div className="bg-grape-600 text-white rounded-3xl rounded-br-md px-4 py-3">{m.text}</div>
        {m.crisis && <p className="text-xs text-coral-600 font-bold mt-1 text-right">🔔 Изпратен е спешен сигнал до психолог</p>}
      </div>
    )
  }
  return (
    <div className="self-start max-w-[85%] animate-fadeUp">
      <div className="bg-white rounded-3xl rounded-bl-md px-4 py-3 shadow-sm">{m.text}</div>
      <p className="text-[11px] text-ink/50 mt-1 ml-2">📝 Демо отговор – написан предварително, не е истински психолог</p>
    </div>
  )
}
