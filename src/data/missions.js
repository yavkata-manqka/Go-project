// Мисии: всяка е под 2 минути.
export const MISSIONS = [
  { id: 'good', type: 'write', emoji: '💛', title: 'Едно хубаво нещо', desc: 'Напиши едно хубаво нещо от днес, дори да е мъничко.', placeholder: 'Днес ми беше хубаво, когато...', badge: 'gratitude' },
  { id: 'breath', type: 'breath', emoji: '🌬️', title: 'Дишане 4-4-4', desc: 'Вдишай 4 сек, задръж 4 сек, издишай 4 сек. Три пъти.', badge: 'breath' },
  { id: 'friend', type: 'action', emoji: '📱', title: 'Пиши на приятел', desc: 'Пиши на някого, с когото отдавна не сте говорили. Едно „Хей, как си?“ стига.', badge: 'friend' },
  { id: 'water', type: 'action', emoji: '💧', title: 'Чаша вода', desc: 'Изпий чаша вода. Мозъкът ти ще ти благодари.' },
  { id: 'proud', type: 'write', emoji: '⭐', title: 'Гордея се, че...', desc: 'Напиши едно нещо, с което се гордееш тази седмица.', placeholder: 'Гордея се, че...' },
  { id: 'stretch', type: 'action', emoji: '🙆', title: 'Протегни се', desc: 'Стани и се протегни за 30 секунди. Като котка.' },
  { id: 'window', type: 'action', emoji: '🪟', title: '5 неща навън', desc: 'Погледни през прозореца и намери 5 неща, които виждаш.' },
  { id: 'kind', type: 'write', emoji: '🫶', title: 'Мило към себе си', desc: 'Напиши едно мило изречение към себе си, както би го казал/а на приятел.', placeholder: 'Ей, ти...' },
]

function hash(str) {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// Всеки ден: 2 или 3 мисии, винаги с дишане или „хубаво нещо“.
export function missionsForDay(dateKey) {
  const h = hash(dateKey)
  const count = h % 3 === 0 ? 2 : 3
  const pool = [...MISSIONS]
  const out = []
  let x = h
  while (out.length < count) {
    x = (x * 1103515245 + 12345) >>> 0
    const m = pool.splice(x % pool.length, 1)[0]
    out.push(m)
  }
  if (!out.some((m) => m.id === 'good' || m.id === 'breath')) out[0] = MISSIONS[h % 2]
  return out
}
