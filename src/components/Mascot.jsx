// „Готи“ – талисманът на GotU. Оригинален, нарисуван със SVG.
// mood: 1–5 (настроение), streak: брой дни поред → „расте“.
export function mascotStage(streak = 0) {
  if (streak >= 30) return { stage: 4, name: 'Готи-легенда', scale: 1.05 }
  if (streak >= 14) return { stage: 3, name: 'Цъфнал Готи', scale: 1 }
  if (streak >= 7) return { stage: 2, name: 'Пораснал Готи', scale: 0.92 }
  if (streak >= 1) return { stage: 1, name: 'Малкият Готи', scale: 0.82 }
  return { stage: 0, name: 'Готи-семенце', scale: 0.7 }
}

const BODY = {
  1: ['#b7c4f5', '#8f9ee6'],
  2: ['#c6b6f7', '#9c86ea'],
  3: ['#c3a9ff', '#9a78f7'],
  4: ['#b99bff', '#7c55e8'],
  5: ['#c9a2ff', '#8a5cf0'],
}

export default function Mascot({ mood = 4, streak = 12, size = 160, animate = true, className = '' }) {
  const { stage, scale } = mascotStage(streak)
  const [c1, c2] = BODY[mood] || BODY[4]
  const gid = `g-${mood}-${stage}`
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`Готи, талисманът на GotU, настроение ${mood} от 5`}
      className={`${animate ? 'animate-floaty' : ''} ${className}`}
    >
      <defs>
        <radialGradient id={gid} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      {/* сянка */}
      <ellipse cx="100" cy="186" rx={52 * scale} ry="7" fill="#2e1b5e" opacity="0.12" />

      <g transform={`translate(100 182) scale(${scale}) translate(-100 -182)`}>
        {/* растение на главата според серията */}
        {stage >= 1 && (
          <g>
            <path d="M100 62 C100 50 100 42 100 34" stroke="#1fa57c" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M100 44 C88 30 74 34 72 40 C82 48 94 48 100 44Z" fill="#3cc196" />
            {stage >= 2 && <path d="M100 38 C112 24 126 28 128 34 C118 42 106 42 100 38Z" fill="#6fd8b3" />}
            {stage >= 3 && (
              <g transform="translate(100 30)">
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="0" cy="-9" rx="6" ry="9" fill="#ff7f66" transform={`rotate(${a})`} />
                ))}
                <circle r="6" fill="#ffd166" />
              </g>
            )}
          </g>
        )}
        {stage === 0 && <path d="M100 66 C96 58 98 52 104 50 C104 56 103 61 100 66Z" fill="#3cc196" />}

        {/* тяло */}
        <path
          d="M100 60 C140 60 165 92 165 128 C165 164 138 182 100 182 C62 182 35 164 35 128 C35 92 60 60 100 60Z"
          fill={`url(#${gid})`}
        />
        {/* ръчички */}
        <ellipse cx="38" cy="140" rx="10" ry="16" fill={c2} transform={mood >= 5 ? 'rotate(35 38 140)' : 'rotate(-15 38 140)'} />
        <ellipse cx="162" cy="140" rx="10" ry="16" fill={c2} transform={mood >= 5 ? 'rotate(-35 162 140)' : 'rotate(15 162 140)'} />
        {/* корем */}
        <ellipse cx="100" cy="150" rx="34" ry="24" fill="#fff" opacity="0.25" />

        {/* лице */}
        <Face mood={mood} />

        {/* корона-легенда */}
        {stage === 4 && (
          <g>
            <path d="M74 66 L80 50 L90 62 L100 46 L110 62 L120 50 L126 66 Z" fill="#ffd166" stroke="#f4a62a" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="100" cy="46" r="3" fill="#ff7f66" />
          </g>
        )}
      </g>

      {(mood === 5 || stage === 4) && (
        <g fill="#ffd166">
          <Sparkle x={30} y={60} />
          <Sparkle x={170} y={80} s={0.7} />
          <Sparkle x={160} y={30} s={0.5} />
        </g>
      )}
    </svg>
  )
}

function Sparkle({ x, y, s = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3Z"
      className="animate-pulse"
    />
  )
}

function Face({ mood }) {
  const ink = '#2a2340'
  return (
    <g>
      {/* бузки */}
      {mood >= 4 && (
        <g fill="#ff7f66" opacity="0.45">
          <ellipse cx="66" cy="128" rx="10" ry="6" />
          <ellipse cx="134" cy="128" rx="10" ry="6" />
        </g>
      )}
      {/* очи */}
      {mood === 5 ? (
        <g stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M70 112 Q78 102 86 112" />
          <path d="M114 112 Q122 102 130 112" />
        </g>
      ) : mood <= 2 ? (
        <g fill={ink}>
          <path d="M70 110 Q78 120 86 110 Z" />
          <path d="M114 110 Q122 120 130 110 Z" />
          <g stroke={ink} strokeWidth="3" strokeLinecap="round">
            <path d="M68 104 L84 98" />
            <path d="M132 104 L116 98" />
          </g>
        </g>
      ) : (
        <g style={{ transformOrigin: '100px 110px' }} className="animate-blink">
          <ellipse cx="78" cy="110" rx="7" ry="9" fill={ink} />
          <ellipse cx="122" cy="110" rx="7" ry="9" fill={ink} />
          <circle cx="80" cy="106" r="2.5" fill="#fff" />
          <circle cx="124" cy="106" r="2.5" fill="#fff" />
        </g>
      )}
      {/* уста */}
      {mood === 1 && <path d="M86 142 Q100 130 114 142" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />}
      {mood === 2 && <path d="M88 140 Q100 134 112 140" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />}
      {mood === 3 && <path d="M88 136 L112 136" stroke={ink} strokeWidth="5" strokeLinecap="round" />}
      {mood === 4 && <path d="M86 132 Q100 146 114 132" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />}
      {mood === 5 && <path d="M82 128 Q100 156 118 128 Z" fill={ink} />}
      {/* сълза */}
      {mood === 1 && <path d="M132 118 C128 126 128 132 132 134 C136 132 136 126 132 118Z" fill="#7cc6ff" />}
    </g>
  )
}
