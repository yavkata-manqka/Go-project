import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ANSWERS, QUIZZES } from '../data/articles'
import Mascot from '../components/Mascot'

export function QuizList() {
  return (
    <div className="page">
      <h1 className="h-title">🧩 Бързи тестове</h1>
      <p className="mt-1 text-ink/70">5 въпроса, под минута. Само за теб, нищо не се запазва.</p>
      <div className="mt-6 grid gap-3">
        {QUIZZES.map((q) => (
          <Link key={q.id} to={`/quiz/${q.id}`} className={`rounded-4xl p-5 flex items-center gap-4 transition hover:scale-[1.02] ${q.color}`}>
            <span className="text-5xl" aria-hidden>{q.emoji}</span>
            <span>
              <span className="block text-xl font-black">{q.title}</span>
              <span className="text-sm text-ink/60">5 въпроса · 1 мин</span>
            </span>
            <span className="ml-auto text-2xl" aria-hidden>›</span>
          </Link>
        ))}
      </div>
      <Disclaimer />
    </div>
  )
}

function Disclaimer() {
  return (
    <p className="mt-6 rounded-2xl bg-yellow-50 border-2 border-yellow-200 p-3 text-sm">
      ⚠️ <b>Това не е диагноза.</b> Тестовете са само за ориентир. Само специалист може да прецени как си наистина.
    </p>
  )
}

export function QuizPage() {
  const { id } = useParams()
  const quiz = QUIZZES.find((q) => q.id === id)
  const [answers, setAnswers] = useState([])
  if (!quiz) return <div className="page">Няма такъв тест.</div>

  const step = answers.length
  const done = step >= quiz.questions.length
  const score = answers.reduce((a, b) => a + b, 0)
  const result = quiz.results.find((r) => score <= r.max)
  const mood = score <= 5 ? 5 : score <= 10 ? 3 : 2

  if (done) {
    return (
      <div className="page text-center">
        <div className="flex justify-center"><Mascot mood={mood} streak={14} size={130} /></div>
        <div className="card mt-4 animate-pop">
          <span className="text-6xl" aria-hidden>{result.emoji}</span>
          <h1 className="text-3xl font-black mt-2">{result.title}</h1>
          <p className="mt-3 text-lg">{result.text}</p>
          <p className="mt-2 text-sm text-ink/50">Резултат: {score} от 15</p>
        </div>
        <Disclaimer />
        <div className="mt-5 grid gap-3">
          <Link to="/chat" className="btn-primary">💬 Поговори с психолог</Link>
          <Link to="/help" className="btn-ghost">📚 Прочети съвети</Link>
          <button onClick={() => setAnswers([])} className="btn-ghost">🔁 Пак</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Link to="/quiz" className="text-sm font-bold text-grape-600 inline-flex min-h-[44px] items-center">← Тестове</Link>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>{quiz.emoji}</span>
        <h1 className="text-2xl font-black">{quiz.title}</h1>
      </div>
      <div className="mt-4 h-3 rounded-full bg-grape-100 overflow-hidden" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={5}>
        <div className="h-full bg-gradient-to-r from-grape-500 to-coral-400 transition-all duration-500" style={{ width: `${(step / quiz.questions.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-sm font-bold text-ink/50">Въпрос {step + 1} от {quiz.questions.length}</p>
      <div key={step} className="card mt-3 animate-fadeUp">
        <h2 className="text-2xl font-black leading-snug">{quiz.questions[step]}</h2>
        <div className="mt-5 grid gap-2">
          {ANSWERS.map((a) => (
            <button key={a.label} onClick={() => setAnswers([...answers, a.score])} className="btn-ghost justify-start text-lg !min-h-[56px]">
              {a.label}
            </button>
          ))}
        </div>
      </div>
      {step > 0 && (
        <button onClick={() => setAnswers(answers.slice(0, -1))} className="mt-3 text-sm font-bold text-ink/60 min-h-[44px]">← Предишен въпрос</button>
      )}
    </div>
  )
}
