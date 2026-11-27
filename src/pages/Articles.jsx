import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ARTICLES, TOPICS } from '../data/articles'
import { useStore } from '../store'
import Stories from '../components/Stories'

export function ArticleList() {
  const [topic, setTopic] = useState(null)
  const list = topic ? ARTICLES.filter((a) => a.topic === topic) : ARTICLES
  return (
    <div className="page">
      <h1 className="h-title">📚 Кратки съвети</h1>
      <p className="mt-1 text-ink/70">По 2–3 минути четене. Без лекции, обещаваме.</p>
      <Stories />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(topic === t.id ? null : t.id)}
            aria-pressed={topic === t.id}
            className={`rounded-3xl p-3 min-h-[88px] flex flex-col items-center justify-center gap-1 font-bold text-sm transition ${t.color} ${topic === t.id ? 'ring-4 ring-grape-400 scale-105' : 'hover:scale-105'}`}
          >
            <span className="text-3xl" aria-hidden>{t.emoji}</span>
            {t.name}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        {list.map((a) => {
          const t = TOPICS.find((x) => x.id === a.topic)
          return (
            <Link key={a.id} to={`/help/${a.id}`} className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
              <span className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl ${t.color}`} aria-hidden>{t.emoji}</span>
              <span className="min-w-0">
                <span className="block font-extrabold text-lg leading-snug">{a.title}</span>
                <span className="text-sm text-ink/60">{t.name} · {a.min} мин</span>
              </span>
              <span className="ml-auto text-grape-400 text-2xl" aria-hidden>›</span>
            </Link>
          )
        })}
      </div>
      <Link to="/quiz" className="card mt-6 flex items-center gap-4 bg-gradient-to-r from-grape-100 to-coral-100">
        <span className="text-4xl" aria-hidden>🧩</span>
        <span><span className="block font-extrabold text-lg">Направи бърз тест</span><span className="text-sm text-ink/70">5 въпроса → резултат и съвет</span></span>
      </Link>
    </div>
  )
}

export function ArticlePage() {
  const { id } = useParams()
  const { state, update } = useStore()
  const a = ARTICLES.find((x) => x.id === id)

  useEffect(() => {
    if (!a || state.role !== 'student') return
    if (state.student.readArticles.includes(a.id)) return
    update((s) => {
      s.student.readArticles.push(a.id)
      if (s.student.readArticles.length >= 3 && !s.student.badges.includes('reader')) s.student.badges.push('reader')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!a) return <div className="page">Няма такава статия. <Link to="/help" className="underline">Назад</Link></div>
  const t = TOPICS.find((x) => x.id === a.topic)
  return (
    <article className="page">
      <Link to="/help" className="text-sm font-bold text-grape-600 inline-flex min-h-[44px] items-center">← Всички съвети</Link>
      <div className={`rounded-4xl p-6 ${t.color}`}>
        <span className="text-5xl" aria-hidden>{t.emoji}</span>
        <p className="mt-2 text-sm font-bold text-ink/60">{t.name} · {a.min} мин четене</p>
        <h1 className="text-3xl font-black leading-tight mt-1">{a.title}</h1>
      </div>
      <p className="mt-5 text-lg leading-relaxed">{a.intro}</p>
      <h2 className="mt-6 text-xl font-black">Какво може да помогне 👇</h2>
      <ol className="mt-3 grid gap-3">
        {a.tips.map((tip, i) => (
          <li key={i} className="card !p-4 flex gap-3 animate-fadeUp" style={{ animationDelay: `${i * 0.07}s` }}>
            <span className="w-8 h-8 shrink-0 rounded-full bg-grape-600 text-white font-black flex items-center justify-center">{i + 1}</span>
            <span className="text-lg">{tip}</span>
          </li>
        ))}
      </ol>
      <div className="card mt-6 bg-grape-50 text-center">
        <p className="font-extrabold text-lg">Искаш да поговориш за това с някого?</p>
        <Link to="/chat" className="btn-primary mt-3">💬 Пиши анонимно на психолог</Link>
      </div>
    </article>
  )
}
