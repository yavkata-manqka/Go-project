import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { STORIES } from '../data/stories'
import { useStore } from '../store'

const SLIDE_MS = 5000

export default function Stories() {
  const { state, update } = useStore()
  const [open, setOpen] = useState(null)
  const seen = state.seenStories || []
  return (
    <section className="mt-5">
      <h2 className="text-lg font-black">🎬 Истории <span className="text-sm font-bold text-ink/50">· по 30 сек</span></h2>
      <div className="mt-2 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {STORIES.map((s) => {
          const isSeen = seen.includes(s.id)
          return (
            <button key={s.id} onClick={() => setOpen(s)} className="shrink-0 w-[76px] flex flex-col items-center gap-1 group" aria-label={`История: ${s.title}`}>
              <span className={`rounded-full p-[3px] ${isSeen ? 'bg-gray-200' : `bg-gradient-to-tr ${s.bg}`}`}>
                <span className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl border-2 border-white group-hover:scale-105 transition">{s.emoji}</span>
              </span>
              <span className="text-[11px] font-bold leading-tight text-center">{s.title}</span>
            </button>
          )
        })}
      </div>
      {open && (
        <Viewer
          story={open}
          onClose={() => setOpen(null)}
          onSeen={() => update((st) => { st.seenStories = [...new Set([...(st.seenStories || []), open.id])] })}
        />
      )}
    </section>
  )
}

function Viewer({ story, onClose, onSeen }) {
  const [i, setI] = useState(0)
  const last = story.slides.length - 1
  useEffect(() => {
    const t = setTimeout(() => (i < last ? setI(i + 1) : finish()), SLIDE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const finish = () => {
    onSeen()
    onClose()
  }
  const next = () => (i < last ? setI(i + 1) : finish())
  const slide = story.slides[i]

  return createPortal(
    <div className="fixed inset-0 z-[55] bg-ink/90 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={story.title}>
      <div className={`relative w-full h-full sm:h-[90vh] sm:max-w-sm sm:rounded-4xl overflow-hidden bg-gradient-to-br ${story.bg} text-white flex flex-col`}>
        <div className="flex gap-1 p-3">
          {story.slides.map((_, k) => (
            <div key={k} className="h-1 flex-1 rounded-full bg-white/35 overflow-hidden">
              <div
                key={`${k}-${i}`}
                className="h-full bg-white"
                style={{ width: k < i ? '100%' : k > i ? '0%' : undefined, animation: k === i ? `storyBar ${SLIDE_MS}ms linear forwards` : undefined }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
          <span className="text-2xl" aria-hidden>{story.emoji}</span>
          <span className="font-extrabold">{story.title}</span>
          <button onClick={onClose} className="ml-auto w-11 h-11 text-2xl" aria-label="Затвори">✕</button>
        </div>
        <div key={i} className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-fadeUp" aria-live="polite">
          <span className="text-8xl animate-pop" aria-hidden>{slide.big}</span>
          <p className="mt-6 text-2xl font-black leading-snug drop-shadow">{slide.text}</p>
        </div>
        <p className="text-center text-xs text-white/70 pb-4">Натисни вдясно за напред, вляво за назад</p>
        <button className="absolute left-0 top-24 bottom-0 w-1/3" onClick={() => setI(Math.max(0, i - 1))} aria-label="Назад" />
        <button className="absolute right-0 top-24 bottom-0 w-2/3" onClick={next} aria-label="Напред" />
      </div>
    </div>,
    document.body,
  )
}
