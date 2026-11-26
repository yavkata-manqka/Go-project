import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, addDays, dateKey, fmtDay, fmtTime, MOODS } from '../store'
import { ROLES } from '../components/Layout'

export function RoleGate({ role }) {
  const { setRole } = useStore()
  const r = ROLES[role]
  return (
    <div className="page text-center">
      <p className="text-6xl" aria-hidden>{r.emoji}</p>
      <h1 className="h-title mt-2">Тази страница е за роля „{r.name}“</h1>
      <p className="mt-2 text-ink/60">В демото можеш да смениш ролята с един бутон.</p>
      <button onClick={() => setRole(role)} className="btn-grape mt-4">Влез като {r.name} (демо)</button>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" role="tablist">
      {tabs.map(([k, label, badge]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`shrink-0 rounded-2xl px-4 min-h-[48px] font-extrabold flex items-center gap-2 transition ${value === k ? 'bg-grape-600 text-white' : 'bg-white text-ink/70 hover:bg-grape-50'}`}
        >
          {label}
          {badge > 0 && <span className={`chip !py-0 !px-2 text-xs ${value === k ? 'bg-white text-grape-700' : 'bg-coral-500 text-white'}`}>{badge}</span>}
        </button>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { state } = useStore()
  const [tab, setTab] = useState('mod')
  if (state.role !== 'admin') return <RoleGate role="admin" />
  const pending = state.community.filter((m) => m.status === 'pending').length
  const reportedMsgs = new Set(state.reports.map((r) => r.msgId)).size

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <p className="text-sm text-ink/60">Табло на администратора</p>
      <h1 className="text-3xl font-black">🛠️ Админ</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['mod', '🛡️ Модерация', pending],
          ['reports', '🚩 Доклади', reportedMsgs],
          ['codes', '🎟️ Училищни кодове', 0],
          ['stats', '📊 Статистика', 0],
        ]}
      />
      {tab === 'mod' && <Moderation />}
      {tab === 'reports' && <Reports />}
      {tab === 'codes' && <Codes />}
      {tab === 'stats' && <Stats />}
    </div>
  )
}

function Moderation() {
  const { state, update } = useStore()
  const list = state.community.filter((m) => m.status === 'pending')
  const set = (id, status) => update((s) => (s.community.find((m) => m.id === id).status = status))
  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-ink/60">
        Съобщенията от ученици чакат тук, преди да се появят в общността. Съобщения с кризисни думи <b>не идват тук</b>: те
        отиват веднага при психолог като спешен случай.
      </p>
      {list.length === 0 && <p className="card text-center">🎉 Опашката е празна! <Link to="/community" className="underline">Виж общността</Link></p>}
      {list.map((m) => (
        <div key={m.id} className="card !p-4">
          <p className="font-extrabold">{m.avatar} {m.author} <span className="font-normal text-sm text-ink/50">· {fmtDay(m.ts)} {fmtTime(m.ts)}</span></p>
          <p className="mt-2 rounded-2xl bg-cream p-3">{m.text}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => set(m.id, 'approved')} className="btn-mint">✓ Одобри</button>
            <button onClick={() => set(m.id, 'rejected')} className="btn-ghost">✕ Отхвърли</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Reports() {
  const { state, update } = useStore()
  const groups = {}
  state.reports.forEach((r) => (groups[r.msgId] ||= []).push(r))
  const entries = Object.entries(groups)
  return (
    <div className="mt-4 grid gap-3">
      {entries.length === 0 && <p className="card text-center">Няма доклади. 🌤️</p>}
      {entries.map(([msgId, reps]) => {
        const m = state.community.find((x) => x.id === msgId)
        if (!m) return null
        return (
          <div key={msgId} className="card !p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-coral-100 text-coral-700">🚩 {reps.length} доклада</span>
              {m.status === 'removed' && <span className="chip bg-gray-100">скрито</span>}
            </div>
            <p className="mt-2 font-extrabold">{m.avatar} {m.author}</p>
            <p className="mt-1 rounded-2xl bg-cream p-3">{m.text}</p>
            <p className="mt-2 text-sm text-ink/60">Причини: {reps.map((r) => `${r.reason} (${r.by})`).join(', ')}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => update((s) => (s.community.find((x) => x.id === msgId).status = 'removed'))} className="btn-primary !text-sm" disabled={m.status === 'removed'}>🙈 Скрий</button>
              <button
                onClick={() =>
                  update((s) => {
                    s.reports = s.reports.filter((r) => r.msgId !== msgId)
                    s.community.find((x) => x.id === msgId).reports = 0
                  })
                }
                className="btn-ghost !text-sm"
              >
                ✓ Затвори доклада
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Codes() {
  const { state, update } = useStore()
  const used = state.schoolCodes.filter((c) => c.used).length
  const add = () =>
    update((s) => {
      const n = s.schoolCodes.length + 1
      s.schoolCodes.push({ code: `GOTU-${String(n).padStart(3, '0')}`, school: 'Ново училище (демо)', used: false, usedBy: null, active: true })
    })
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-bold">{used} използвани от {state.schoolCodes.length} кода</p>
        <button onClick={add} className="btn-grape ml-auto !min-h-[44px] text-sm">＋ Нов код</button>
      </div>
      <p className="text-sm text-ink/60 mt-1">Един код = един акаунт. Така няма фалшиви профили.</p>
      <div className="mt-3 card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-grape-50 text-left">
            <tr>
              <th className="p-3">Код</th>
              <th className="p-3 hidden sm:table-cell">Училище</th>
              <th className="p-3">Статус</th>
              <th className="p-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody>
            {state.schoolCodes.map((c) => (
              <tr key={c.code} className="border-t border-grape-50">
                <td className="p-3 font-mono font-bold">{c.code}</td>
                <td className="p-3 hidden sm:table-cell text-ink/60">{c.school}</td>
                <td className="p-3">
                  {!c.active ? <span className="chip bg-gray-100 text-ink/50">деактивиран</span> : c.used ? <span className="chip bg-grape-100 text-grape-700">{c.usedBy}</span> : <span className="chip bg-mint-100 text-mint-700">свободен</span>}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => update((s) => (s.schoolCodes.find((x) => x.code === c.code).active = !c.active))} className="text-xs font-bold underline text-ink/60 min-h-[36px]">
                    {c.active ? 'Деактивирай' : 'Активирай'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------- Статистика (анонимна, демо) ----------
const DEMO_MOOD = [3.6, 3.5, 3.4, 3.7, 3.8, 3.3, 3.1, 3.4, 3.6, 3.5, 3.2, 3.0, 3.3, 3.5]
const DEMO_ACTIVE = [64, 71, 69, 75, 80, 52, 48, 77, 82, 79, 85, 90, 61, 58]

function Stats() {
  const { state, now } = useStore()
  const days = DEMO_MOOD.map((mood, i) => {
    const d = addDays(now, -(13 - i))
    return { key: dateKey(d), label: fmtDay(d), mood, active: DEMO_ACTIVE[i] }
  })
  const registered = state.schoolCodes.filter((c) => c.used).length + 140
  const bookings = state.bookings.filter((b) => b.status !== 'released' && b.status !== 'cancelled').length + 23
  const urgent = state.urgent.length
  const avg = (DEMO_MOOD.reduce((a, b) => a + b, 0) / DEMO_MOOD.length).toFixed(1)

  return (
    <div className="mt-4">
      <p className="text-sm text-ink/60">📌 Само анонимни, обобщени данни. Никакви имена. <b>🧪 Числата са измислени за демото.</b></p>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile big={days[days.length - 1].active} label="активни днес" />
        <Tile big={registered} label="регистрирани ученици" />
        <Tile big={bookings} label="запазени часа" />
        <Tile big={urgent} label="спешни сигнала" />
      </div>

      <div className="card mt-4">
        <h2 className="text-lg font-black">Средно настроение по дни</h2>
        <p className="text-sm text-ink/60">Последните 14 дни · средно {avg} от 5 · спадът е около контролните</p>
        <LineChart data={days} />
      </div>

      <div className="card mt-4">
        <h2 className="text-lg font-black">Активни потребители по дни</h2>
        <p className="text-sm text-ink/60">Уикендите са по-тихи (което е добре 🙂)</p>
        <BarChart data={days} />
      </div>
    </div>
  )
}

function Tile({ big, label }) {
  return (
    <div className="card !p-4">
      <p className="text-3xl font-black text-grape-700">{big}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  )
}

const W = 640
const H = 220
const PAD = { l: 40, r: 12, t: 12, b: 28 }

function useHover() {
  const [i, setI] = useState(null)
  return [i, setI]
}

function LineChart({ data }) {
  const [hi, setHi] = useHover()
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (data.length - 1)
  const y = (v) => PAD.t + ((5 - v) * (H - PAD.t - PAD.b)) / 4
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.mood)}`).join(' ')
  const step = (W - PAD.l - PAD.r) / (data.length - 1)
  return (
    <div className="relative mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Линейна графика на средното настроение за 14 дни">
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#2a2340" strokeOpacity="0.08" />
            <text x={PAD.l - 8} y={y(v) + 5} fontSize="14" textAnchor="end">{MOODS[v - 1].emoji}</text>
          </g>
        ))}
        {data.map((d, i) => i % 3 === 1 && (
          <text key={d.key} x={x(i)} y={H - 6} fontSize="11" textAnchor="middle" fill="#2a2340" fillOpacity="0.55">{d.label.split(', ')[1]}</text>
        ))}
        <path d={path} fill="none" stroke="#6a3fd6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hi !== null && (
          <>
            <line x1={x(hi)} x2={x(hi)} y1={PAD.t} y2={H - PAD.b} stroke="#2a2340" strokeOpacity="0.25" strokeDasharray="3 3" />
            <circle cx={x(hi)} cy={y(data[hi].mood)} r="5" fill="#6a3fd6" stroke="#fff" strokeWidth="2" />
          </>
        )}
        {data.map((d, i) => (
          <rect key={d.key} x={x(i) - step / 2} y={0} width={step} height={H} fill="transparent" onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} onTouchStart={() => setHi(i)} />
        ))}
      </svg>
      {hi !== null && <Tip x={(x(hi) / W) * 100}>{data[hi].label}: <b>{data[hi].mood.toFixed(1)}</b> / 5</Tip>}
      <SrTable data={data} col="mood" name="Средно настроение" />
    </div>
  )
}

function BarChart({ data }) {
  const [hi, setHi] = useHover()
  const max = 100
  const slot = (W - PAD.l - PAD.r) / data.length
  const bw = slot - 6
  const y = (v) => PAD.t + ((max - v) * (H - PAD.t - PAD.b)) / max
  const base = H - PAD.b
  return (
    <div className="relative mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Стълбовидна графика на активните потребители за 14 дни">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#2a2340" strokeOpacity="0.08" />
            <text x={PAD.l - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="#2a2340" fillOpacity="0.55">{v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x0 = PAD.l + i * slot + 3
          const top = y(d.active)
          const r = 4
          return (
            <g key={d.key} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} onTouchStart={() => setHi(i)}>
              <rect x={x0 - 3} y={PAD.t} width={slot} height={base - PAD.t} fill="transparent" />
              <path
                d={`M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${base} Z`}
                fill={hi === i ? '#5631b0' : '#9a78f7'}
              />
              {i % 3 === 1 && <text x={x0 + bw / 2} y={H - 6} fontSize="11" textAnchor="middle" fill="#2a2340" fillOpacity="0.55">{d.label.split(', ')[1]}</text>}
            </g>
          )
        })}
      </svg>
      {hi !== null && <Tip x={((PAD.l + hi * slot + slot / 2) / W) * 100}>{data[hi].label}: <b>{data[hi].active}</b> активни</Tip>}
      <SrTable data={data} col="active" name="Активни потребители" />
    </div>
  )
}

function Tip({ x, children }) {
  return (
    <div className="absolute top-0 pointer-events-none -translate-x-1/2 rounded-xl bg-ink text-white text-xs px-2 py-1 whitespace-nowrap" style={{ left: `${Math.min(85, Math.max(15, x))}%` }}>
      {children}
    </div>
  )
}

function SrTable({ data, col, name }) {
  return (
    <table className="sr-only">
      <caption>{name}</caption>
      <tbody>
        {data.map((d) => (
          <tr key={d.key}><th>{d.label}</th><td>{d[col]}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
