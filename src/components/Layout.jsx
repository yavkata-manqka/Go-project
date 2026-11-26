import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import Mascot from './Mascot'

export const SLOGAN = 'Не си сам. Винаги има кой да ти отговори.'

export const ROLES = {
  guest: { emoji: '👀', name: 'Гост', desc: 'Ниво 0 – без регистрация' },
  student: { emoji: '🎒', name: 'Ученик', desc: 'Нива 1–2 – игра, общност, часове' },
  psych: { emoji: '🩺', name: 'Психолог', desc: 'Часове, спешни случаи, чатове' },
  admin: { emoji: '🛠️', name: 'Админ', desc: 'Модерация, кодове, статистика' },
}

export function Logo({ small }) {
  return (
    <Link to="/" className="flex items-center gap-1.5 font-black tracking-tight" aria-label="GotU – начало">
      <Mascot size={small ? 30 : 36} mood={5} streak={14} animate={false} />
      <span className={`${small ? 'text-xl' : 'text-2xl'} bg-gradient-to-r from-grape-600 to-coral-500 bg-clip-text text-transparent`}>GotU</span>
    </Link>
  )
}

export function DemoBanner() {
  return (
    <div className="bg-ink text-white text-center text-xs sm:text-sm font-bold py-1.5 px-3">
      🧪 Демо версия – данните са измислени
    </div>
  )
}

function RoleSwitcher() {
  const { state, setRole, resetDemo, nextDay } = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const r = ROLES[state.role]

  const pick = (role) => {
    setRole(role)
    setOpen(false)
    nav(role === 'psych' ? '/psych' : role === 'admin' ? '/admin' : '/app')
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost !min-h-[44px] !px-3 text-sm" aria-haspopup="dialog">
        <span aria-hidden>🎭</span>
        <span className="hidden sm:inline">Смени ролята (демо):</span>
        <span className="sm:hidden">Роля:</span>
        <span className="text-grape-600">{r.emoji} {r.name}</span>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Смени ролята"
            className="w-full sm:max-w-md bg-white rounded-t-4xl sm:rounded-4xl p-6 animate-fadeUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-black">🎭 Смени ролята</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost !min-h-[44px] !px-3" aria-label="Затвори">✕</button>
            </div>
            <p className="text-sm text-ink/60 mb-4">Само за демото в час: виж платформата през очите на различни хора.</p>
            <div className="grid gap-2">
              {Object.entries(ROLES).map(([key, x]) => (
                <button
                  key={key}
                  onClick={() => pick(key)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition hover:border-grape-400 ${state.role === key ? 'border-grape-500 bg-grape-50' : 'border-grape-100'}`}
                >
                  <span className="text-3xl" aria-hidden>{x.emoji}</span>
                  <span>
                    <span className="block font-extrabold">{x.name}</span>
                    <span className="block text-sm text-ink/60">{x.desc}</span>
                  </span>
                  {state.role === key && <span className="ml-auto chip bg-grape-600 text-white">избрано</span>}
                </button>
              ))}
            </div>
            <div className="mt-5 border-t pt-4 grid gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Демо инструменти</p>
              <button onClick={() => { nextDay(); setOpen(false) }} className="btn-ghost text-sm">
                ⏩ Превърти 1 ден напред {state.dayOffset > 0 && <span className="chip bg-mint-100 text-mint-700">+{state.dayOffset} дни</span>}
              </button>
              <button
                onClick={() => {
                  if (confirm('Да върна ли всички демо данни в началото?')) {
                    resetDemo()
                    setOpen(false)
                    nav('/')
                  }
                }}
                className="btn-ghost text-sm"
              >
                🔄 Нулирай демото
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b border-grape-100">
      <div className="mx-auto max-w-6xl flex items-center gap-3 px-4 py-2">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 ml-4 text-sm font-bold">
          <HeaderLink to="/app">Приложение</HeaderLink>
          <HeaderLink to="/help">Статии</HeaderLink>
          <HeaderLink to="/about">За проекта</HeaderLink>
        </nav>
        <div className="ml-auto">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  )
}

function HeaderLink({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `rounded-xl px-3 py-2 hover:bg-grape-50 ${isActive ? 'text-grape-600' : ''}`}>
      {children}
    </NavLink>
  )
}

const TABS = {
  guest: [
    ['/app', '🏠', 'Начало'],
    ['/chat', '💬', 'Чат'],
    ['/help', '📚', 'Статии'],
    ['/quiz', '🧩', 'Тестове'],
  ],
  student: [
    ['/app', '🏠', 'Начало'],
    ['/community', '👥', 'Общност'],
    ['/booking', '📅', 'Час'],
    ['/help', '📚', 'Статии'],
  ],
  psych: [
    ['/psych', '🩺', 'Табло'],
    ['/community', '👥', 'Общност'],
    ['/help', '📚', 'Статии'],
  ],
  admin: [
    ['/admin', '🛠️', 'Табло'],
    ['/community', '👥', 'Общност'],
    ['/about', 'ℹ️', 'Проект'],
  ],
}

export function BottomNav() {
  const { state } = useStore()
  const { pathname } = useLocation()
  if (pathname === '/' || pathname === '/about') return null
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-grape-100" aria-label="Основно меню">
      <div className="mx-auto max-w-2xl flex">
        {TABS[state.role].map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] text-xs font-bold transition ${isActive ? 'text-grape-600' : 'text-ink/60'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition ${isActive ? 'scale-125' : ''}`} aria-hidden>{icon}</span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function HelpButton() {
  const { pathname } = useLocation()
  if (pathname === '/chat') return null
  const onLanding = pathname === '/' || pathname === '/about'
  return (
    <Link
      to="/chat"
      className={`fixed right-4 z-30 flex items-center gap-2 rounded-full bg-coral-500 text-white font-extrabold pl-3 pr-4 min-h-[52px] shadow-[0_8px_24px_-6px_rgba(244,98,63,0.6)] hover:bg-coral-600 transition hover:scale-105 ${onLanding ? 'bottom-5' : 'bottom-[76px]'}`}
    >
      <span className="text-2xl" aria-hidden>💬</span>
      <span className="text-sm leading-tight">GotU<br className="sm:hidden" /><span className="hidden sm:inline"> – </span>говори с някого</span>
    </Link>
  )
}

export function Footer() {
  const { pathname } = useLocation()
  const pad = pathname === '/' || pathname === '/about' ? 'pb-24' : 'pb-40'
  return (
    <footer className={`bg-grape-900 text-white mt-10 ${pad}`}>
      <div className="mx-auto max-w-6xl px-4 pt-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-3xl font-black">GotU</div>
          <p className="mt-2 text-lg font-bold text-grape-200">{SLOGAN}</p>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-bold uppercase tracking-wide text-grape-300">Нужна ти е помощ веднага?</p>
          <a href="tel:116111" className="flex items-center gap-3 rounded-2xl bg-white/10 hover:bg-white/20 p-3 transition">
            <span className="text-2xl" aria-hidden>📞</span>
            <span><span className="block text-2xl font-black">116 111</span><span className="text-sm text-grape-200">Национална телефонна линия за деца – безплатно, 24/7</span></span>
          </a>
          <a href="tel:112" className="flex items-center gap-3 rounded-2xl bg-coral-500/90 hover:bg-coral-500 p-3 transition">
            <span className="text-2xl" aria-hidden>🚨</span>
            <span><span className="block text-2xl font-black">112</span><span className="text-sm">При спешност и опасност</span></span>
          </a>
        </div>
        <div className="text-sm text-grape-200 grid gap-2 content-start">
          <Link to="/about" className="hover:text-white font-bold">За проекта</Link>
          <Link to="/help" className="hover:text-white font-bold">Статии и съвети</Link>
          <Link to="/chat" className="hover:text-white font-bold">Пиши анонимно</Link>
          <p className="mt-3">Пилотен проект за училища в Бургас, създаден за проект по гражданско образование.</p>
          <p>🧪 Демо версия – всички хора, психолози и съобщения са измислени.</p>
        </div>
      </div>
    </footer>
  )
}

export function CrisisModal() {
  const { crisis, closeCrisis } = useStore()
  const nav = useNavigate()
  useEffect(() => {
    if (!crisis) return
    const onKey = (e) => e.key === 'Escape' && closeCrisis()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [crisis, closeCrisis])
  if (!crisis) return null
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-b from-sky-100 via-grape-50 to-cream">
      <div role="alertdialog" aria-modal="true" aria-labelledby="crisis-title" className="mx-auto max-w-md min-h-full flex flex-col items-center justify-center text-center px-5 py-10 animate-fadeUp">
        <Mascot mood={3} streak={14} size={130} />
        <h2 id="crisis-title" className="mt-4 text-3xl font-black leading-tight text-grape-800">{SLOGAN}</h2>
        <p className="mt-4 text-lg">
          Това, което написа, звучи много тежко. Благодарим ти, че го сподели. 💜
          <br />
          Има хора, които могат да ти помогнат <b>точно сега</b>.
        </p>
        <div className="mt-6 grid gap-3 w-full">
          <a href="tel:116111" className="rounded-3xl bg-grape-600 text-white p-4 shadow-lg hover:bg-grape-700 transition">
            <span className="block text-sm font-bold opacity-90">📞 Обади се безплатно, 24/7</span>
            <span className="block text-4xl font-black tracking-wide">116 111</span>
            <span className="block text-sm opacity-90">Национална телефонна линия за деца – психолози</span>
          </a>
          <a href="tel:112" className="rounded-3xl bg-coral-500 text-white p-4 shadow-lg hover:bg-coral-600 transition">
            <span className="block text-sm font-bold opacity-90">🚨 Ако си в опасност сега</span>
            <span className="block text-4xl font-black tracking-wide">112</span>
          </a>
          <button
            onClick={() => {
              closeCrisis()
              nav('/chat')
            }}
            className="btn-mint w-full"
          >
            💬 Пиши на психолог от GotU
          </button>
        </div>
        <p className="mt-5 text-sm text-ink/70 bg-white/70 rounded-2xl p-3">
          🔔 Психолог от GotU е уведомен и ще ти пише възможно най-скоро. <span className="text-ink/50">(демо)</span>
        </p>
        <button onClick={closeCrisis} className="mt-4 text-sm font-bold text-ink/60 underline min-h-[44px]">
          Добре съм, искам да се върна
        </button>
      </div>
    </div>
  )
}
