import { Link } from 'react-router-dom'
import Mascot from '../components/Mascot'
import { SLOGAN } from '../components/Layout'

const STATS = [
  { big: '[XX]%', text: 'от анкетираните ученици предпочитат да ПИШАТ, вместо да се обаждат по телефона', src: 'Източник: наша анкета, [брой] ученици, Бургас, [месец] 2026', color: 'bg-grape-100 text-grape-700' },
  { big: '[XX]%', text: 'от анкетираните не биха отишли при училищния психолог, защото им е неудобно', src: 'Източник: наша анкета, [брой] ученици', color: 'bg-coral-100 text-coral-700' },
  { big: '[XX]%', text: 'от анкетираните не знаят, че има безплатна линия 116 111 с психолози', src: 'Източник: наша анкета, [брой] ученици', color: 'bg-mint-100 text-mint-700' },
  { big: '1 от 7', text: 'тийнейджъри между 10 и 19 години по света живее с психичен проблем', src: 'Източник: Световна здравна организация (СЗО), 2021', color: 'bg-yellow-100 text-yellow-800' },
]

const STEPS = [
  {
    n: '01', emoji: '💬', title: 'Пиши веднага', tag: 'Без регистрация',
    text: 'Анонимен чат с психолог, кратки статии за приятели, семейство, тормоз, стрес и любов, плюс бързи тестове. Нищо не се запазва.',
    color: 'from-grape-500 to-grape-700',
  },
  {
    n: '02', emoji: '🔥', title: 'Грижи се за себе си', tag: 'С училищен код',
    text: 'Vibe Check всеки ден, мини мисии под 2 минути, серия с 🔥, значки и общност, в която всяко съобщение се проверява.',
    color: 'from-coral-400 to-coral-600',
  },
  {
    n: '03', emoji: '📅', title: 'Говори с психолог', tag: 'Постоянна подкрепа',
    text: 'Запази си час онлайн или на живо при конкретен психолог. Получаваш и значка „Смелост“, защото да поискаш помощ е готино.',
    color: 'from-mint-400 to-mint-600',
  },
]

const PARENTS = [
  { emoji: '🧭', title: 'Какво прави GotU', text: 'Дава на тийнейджърите лесен достъп до психолози чрез текстов чат, плюс инструменти за самопомощ и подкрепяща общност.' },
  { emoji: '🛡️', title: 'Безопасност', text: 'Всяко съобщение в общността се проверява преди публикуване. При тревожни думи детето веднага вижда 116 111 и 112, а психолог получава спешен сигнал.' },
  { emoji: '✍️', title: 'Съгласие', text: 'Под 14 години е нужно съгласие на родител. За редовни сесии с психолог (ниво 2) винаги е нужно съгласие на родител.' },
  { emoji: '🚫', title: 'Без продажба на данни', text: 'Без реклами. Без продажба на данни. Децата използват прякор, а истинските имена никога не се показват.' },
]

const FAQ = [
  ['Наистина ли е анонимно?', 'Да. В анонимния чат не ти трябва акаунт и нищо не се запазва след като затвориш. В общността се показва само прякорът ти, никога истинското име.'],
  ['Кой ми отговаря?', 'Квалифицирани психолози, не бот и не изкуствен интелект. (В тази демо версия отговорите са предварително написани и са отбелязани като демо.)'],
  ['Струва ли нещо?', 'Не. GotU е безплатен за учениците.'],
  ['Защо ми трябва училищен код?', 'Един код = един акаунт. Така няма фалшиви профили и общността остава безопасна.'],
  ['Ще разберат ли родителите или учителите ми?', 'Не, анонимният чат е само твой. Изключение има само ако си в опасност: тогава безопасността ти е по-важна от всичко.'],
  ['Какво става, ако ми е много тежко точно сега?', 'Обади се на 116 111 (безплатно, 24/7) или на 112 при спешност. Номерата са винаги долу на всяка страница.'],
  ['Колко време трябва да прекарвам в приложението?', 'Малко! Мисиите са до 2 минути и свършват за деня. GotU не иска да висиш в телефона, а да ти е по-добре.'],
]

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-grape-100 via-cream to-coral-50">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-mint-200/50 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-coral-200/50 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-fadeUp">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="chip bg-white text-grape-700">🔒 Анонимно</span>
              <span className="chip bg-white text-coral-600">💬 Пишеш, не звъниш</span>
              <span className="chip bg-white text-mint-700">🆓 Безплатно</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
              Психолог в джоба ти.
              <br />
              <span className="bg-gradient-to-r from-grape-600 to-coral-500 bg-clip-text text-transparent">Само с текст.</span>
            </h1>
            <p className="mt-5 text-xl sm:text-2xl font-extrabold text-grape-700">„{SLOGAN}“</p>
            <p className="mt-3 text-lg text-ink/70 max-w-md">GotU прави търсенето на помощ нормално, модерно и дори малко забавно.</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/chat" className="btn-primary text-lg">💬 Пиши анонимно сега</Link>
              <a href="#how" className="btn-ghost text-lg">Как работи 👇</a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <Mascot mood={5} streak={30} size={300} />
              <div className="absolute top-6 -left-6 sm:-left-14 card !p-3 !rounded-2xl text-sm font-bold animate-pop [animation-delay:.4s]">Хей, как си днес? 👋</div>
              <div className="absolute bottom-10 -right-4 sm:-right-10 card !p-3 !rounded-2xl text-sm font-bold animate-pop [animation-delay:.8s]">🔥 12 дни поред!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ПРОБЛЕМЪТ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="chip bg-coral-100 text-coral-700 mb-3">Проблемът</p>
        <h2 className="h-title max-w-3xl">Помощ има. Но тийнейджърите не звънят, а пишат.</h2>
        <p className="mt-4 text-lg text-ink/70 max-w-3xl">
          В България има безплатна линия с психолози: <b>116 111</b>, денонощно. Но тя е почти само по <b>телефон</b>. А да отидеш при
          училищния психолог често е неудобно: всички те виждат в коридора.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="card flex flex-col animate-fadeUp" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`self-start rounded-2xl px-3 py-1 text-4xl font-black ${s.color}`}>{s.big}</div>
              <p className="mt-3 font-bold text-lg leading-snug flex-1">{s.text}</p>
              <p className="mt-3 text-xs text-ink/50">{s.src}</p>
            </div>
          ))}
        </div>
      </section>

      {/* КАК РАБОТИ */}
      <section id="how" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="chip bg-grape-100 text-grape-700 mb-3">Как работи</p>
          <h2 className="h-title">Три нива. Ти избираш колко близо да дойдеш.</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className={`rounded-4xl p-6 text-white bg-gradient-to-br ${s.color} shadow-lg transition hover:-translate-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-black opacity-90">{s.n}</span>
                  <span className="text-4xl" aria-hidden>{s.emoji}</span>
                </div>
                <span className="mt-4 chip bg-white/25">{s.tag}</span>
                <h3 className="mt-2 text-2xl font-black">{s.title}</h3>
                <p className="mt-2 text-white/95">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/app" className="btn-grape text-lg">Разгледай приложението →</Link>
          </div>
        </div>
      </section>

      {/* ЗА РОДИТЕЛИ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="chip bg-mint-100 text-mint-700 mb-3">За родители</p>
        <h2 className="h-title">Безопасно място за вашето дете</h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {PARENTS.map((p) => (
            <div key={p.title} className="card flex gap-4">
              <span className="text-4xl" aria-hidden>{p.emoji}</span>
              <div>
                <h3 className="text-xl font-black">{p.title}</h3>
                <p className="mt-1 text-ink/75">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ВЪПРОСИ */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="chip bg-yellow-100 text-yellow-800 mb-3">Въпроси</p>
          <h2 className="h-title">Често питате</h2>
          <div className="mt-6 grid gap-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-3xl border-2 border-grape-100 bg-cream p-4 open:border-grape-300">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-extrabold text-lg min-h-[44px]">
                  {q}
                  <span className="text-grape-500 transition group-open:rotate-45 text-2xl" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-ink/75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-4xl bg-gradient-to-r from-grape-600 to-coral-500 p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-black">{SLOGAN}</h2>
          <p className="mt-3 text-lg text-white/90">Отнема 10 секунди. Без име. Без обаждане.</p>
          <Link to="/chat" className="mt-6 btn bg-white text-grape-700 text-lg shadow-lg hover:scale-105">💬 Пиши анонимно сега</Link>
        </div>
      </section>
    </div>
  )
}
