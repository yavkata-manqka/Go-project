import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, weekKey } from '../store'
import Mascot from '../components/Mascot'

const AVATARS = ['🐱', '🦊', '🐸', '🐼', '🐯', '🦄', '🐙', '🐨', '🐧', '🦋', '🌵', '👾']
const NICK_IDEAS = ['ТихаВълна', 'Кексче', 'НощнаСова', 'Комета', 'ЗеленЧай', 'Морско']

export default function Register() {
  const { state, update, now } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [age, setAge] = useState(null)
  const [nick, setNick] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [sending, setSending] = useState(false)

  const checkCode = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    const found = state.schoolCodes.find((x) => x.code === c)
    if (!found) return setErr('Този код не съществува. Провери го пак или питай класния. (Демо кодове: GOTU-001 до GOTU-020)')
    if (!found.active) return setErr('Този код е деактивиран. Питай училищния координатор.')
    if (found.used) return setErr('Този код вече е използван. Един код = един акаунт. 🙂 (Свободни: GOTU-006, 008, 010, 011, 013…)')
    setErr('')
    setStep('age')
  }

  const pickAge = (a) => {
    setAge(a)
    setStep(a < 14 ? 'consent' : 'profile')
  }

  const finish = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    const n = nick.trim()
    if (n.length < 3) return setErr('Прякорът трябва да е поне 3 символа.')
    update((s) => {
      const sc = s.schoolCodes.find((x) => x.code === c)
      sc.used = true
      sc.usedBy = n
      s.student = {
        nickname: n,
        avatar,
        age,
        code: c,
        consentUnder14: age < 14,
        consentLevel2: false,
        streak: 0,
        lastCheckIn: null,
        freezeWeek: weekKey(now),
        freezesUsed: 0,
        moodHistory: [],
        badges: [],
        missionsDone: {},
        journal: [],
        readArticles: [],
        noShows: 0,
        lowMoodDismissed: '',
        lastMessage: '🎉 Добре дошъл/дошла! Направи първия си Vibe Check и Готи ще започне да расте.',
      }
      s.role = 'student'
    })
    nav('/app')
  }

  const steps = ['code', 'age', 'profile']
  const idx = step === 'consent' ? 1 : steps.indexOf(step)

  return (
    <div className="page">
      <div className="flex items-center gap-3">
        <Mascot mood={5} streak={0} size={90} />
        <div>
          <h1 className="text-3xl font-black">Регистрация</h1>
          <p className="text-ink/60">3 бързи стъпки. Без истинско име.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2" aria-hidden>
        {steps.map((s, i) => <div key={s} className={`h-2 flex-1 rounded-full ${i <= idx ? 'bg-grape-500' : 'bg-grape-100'}`} />)}
      </div>

      {step === 'code' && (
        <form onSubmit={checkCode} className="card mt-5 animate-fadeUp">
          <h2 className="text-xl font-black">🎟️ Въведи училищния си код</h2>
          <p className="text-sm text-ink/60 mt-1">Получаваш го в училище. Един код = един акаунт, така няма фалшиви профили.</p>
          <label htmlFor="code" className="sr-only">Училищен код</label>
          <input id="code" className="input mt-4 text-center text-2xl font-black tracking-widest uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="GOTU-000" autoComplete="off" />
          {err && <p className="mt-2 text-sm font-bold text-coral-600" role="alert">{err}</p>}
          <button className="btn-grape w-full mt-4">Напред →</button>
          <p className="text-xs text-ink/50 mt-3 text-center">🧪 Демо: пробвай <b>GOTU-006</b> или <b>GOTU-013</b></p>
        </form>
      )}

      {step === 'age' && (
        <div className="card mt-5 animate-fadeUp">
          <h2 className="text-xl font-black">🎂 На колко години си?</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[12, 13, 14, 15, 16, 17, 18, 19].map((a) => (
              <button key={a} onClick={() => pickAge(a)} className="btn-ghost text-xl">{a}{a === 19 ? '+' : ''}</button>
            ))}
          </div>
        </div>
      )}

      {step === 'consent' && (
        <div className="card mt-5 animate-fadeUp">
          <h2 className="text-xl font-black">👨‍👩‍👧 Съгласие от родител</h2>
          <p className="mt-2 text-ink/75">
            Под 14 години законът изисква родител да даде съгласие. Ще изпратим кратко съобщение на родителя ти. В него
            няма да пише какво споделяш, само какво е GotU.
          </p>
          {!sending ? (
            <button onClick={() => { setSending(true); setTimeout(() => setStep('profile'), 1800) }} className="btn-grape w-full mt-4">
              📩 Изпрати молба на родител (демо)
            </button>
          ) : (
            <div className="mt-4 text-center font-bold text-mint-700 animate-pop">✅ Родителят потвърди! (симулирано)</div>
          )}
          <p className="text-xs text-ink/50 mt-3">Междувременно можеш да ползваш анонимния чат и статиите без регистрация.</p>
        </div>
      )}

      {step === 'profile' && (
        <form onSubmit={finish} className="card mt-5 animate-fadeUp">
          <h2 className="text-xl font-black">😎 Избери прякор и аватар</h2>
          <p className="text-sm text-ink/60 mt-1">Не пиши истинското си име. Никой няма да го вижда.</p>
          <div className="mt-4 flex justify-center">
            <span className="w-24 h-24 rounded-4xl bg-grape-100 flex items-center justify-center text-6xl animate-pop" key={avatar} aria-hidden>{avatar}</span>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2" role="radiogroup" aria-label="Аватар">
            {AVATARS.map((a) => (
              <button type="button" key={a} role="radio" aria-checked={avatar === a} onClick={() => setAvatar(a)} className={`text-3xl rounded-2xl min-h-[52px] transition ${avatar === a ? 'bg-grape-100 ring-2 ring-grape-500 scale-110' : 'bg-cream hover:scale-110'}`}>
                {a}
              </button>
            ))}
          </div>
          <label htmlFor="nick" className="block mt-5 font-bold">Прякор</label>
          <input id="nick" className="input mt-1" value={nick} maxLength={16} onChange={(e) => setNick(e.target.value)} placeholder="напр. НощнаСова" />
          <div className="mt-2 flex flex-wrap gap-1">
            {NICK_IDEAS.map((n) => (
              <button type="button" key={n} onClick={() => setNick(n)} className="chip bg-cream text-ink/70 hover:bg-grape-50 min-h-[36px]">{n}</button>
            ))}
          </div>
          {err && <p className="mt-2 text-sm font-bold text-coral-600" role="alert">{err}</p>}
          <button className="btn-primary w-full mt-5">Готово! 🎉</button>
        </form>
      )}

      <p className="text-center mt-6 text-sm">
        <Link to="/app" className="underline text-ink/60">Не сега, продължи без регистрация</Link>
      </p>
    </div>
  )
}
