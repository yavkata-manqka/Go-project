import { Link } from 'react-router-dom'
import Mascot from '../components/Mascot'
import { SLOGAN } from '../components/Layout'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Mascot mood={4} streak={20} size={150} />
        <div>
          <p className="chip bg-grape-100 text-grape-700">За проекта</p>
          <h1 className="h-title mt-2">Какво е GotU и защо го направихме</h1>
          <p className="mt-2 text-lg font-bold text-grape-700">„{SLOGAN}“</p>
        </div>
      </div>

      <Block emoji="😟" title="Проблемът">
        В България помощ има. Например Националната телефонна линия за деца <b>116 111</b> е безплатна, денонощна и на нея
        отговарят психолози. Но тя е достъпна почти само чрез <b>обаждане</b>, а повечето тийнейджъри предпочитат да <b>пишат</b>.
        Да отидеш при училищния психолог пък често е неудобно. Затова много млади хора остават сами с проблемите си.
      </Block>

      <Block emoji="💡" title="Решението">
        GotU дава на тийнейджърите <b>лесен, бърз и анонимен</b> достъп до психолози чрез текстов чат. Добавяме инструменти за
        самопомощ, безопасна общност и малко игра, за да стане търсенето на помощ нещо нормално и дори готино.
      </Block>

      <div className="mt-8 grid gap-3">
        <Level n="0" color="bg-grape-100" title="Без регистрация" text="Анонимен чат с психолог, статии по теми и кратки тестове за самооценка." />
        <Level n="1" color="bg-coral-100" title="Регистрация с училищен код" text="Прякор и емоджи вместо име. Ежедневен Vibe Check, мини мисии, серия, значки и модерирана общност." />
        <Level n="2" color="bg-mint-100" title="Постоянна подкрепа" text="Запазване на час онлайн или на живо при конкретен психолог, със съгласие на родител." />
      </div>

      <Block emoji="🇬🇧" title="Работи ли такъв модел?">
        Да. Във Великобритания платформата <b>Kooth</b> работи по подобен начин (анонимен чат със специалисти, модерирана общност
        и инструменти за самопомощ) и се използва от много училища и местни власти. Вдъхновихме се от структурата ѝ, а
        от приложението <b>Finch</b> – от нежната игра с талисман. GotU има собствен дизайн и талисман: Готи.
      </Block>

      <Block emoji="📍" title="Пилотен проект">
        GotU е замислен като <b>пилотен проект за училища в Бургас</b>. Създаден е от ученици като проект по{' '}
        <b>гражданско образование</b>. Това, което виждате, е <b>демо версия</b>: всички потребители, психолози и
        съобщения са измислени, а данните се пазят само във вашия браузър.
      </Block>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link to="/app" className="btn-primary">Разгледай приложението</Link>
        <Link to="/" className="btn-ghost">Към началото</Link>
      </div>
    </div>
  )
}

function Block({ emoji, title, children }) {
  return (
    <section className="card mt-6">
      <h2 className="text-2xl font-black flex items-center gap-2"><span aria-hidden>{emoji}</span>{title}</h2>
      <p className="mt-2 text-ink/80 text-lg leading-relaxed">{children}</p>
    </section>
  )
}

function Level({ n, color, title, text }) {
  return (
    <div className={`rounded-3xl p-4 flex gap-4 items-center ${color}`}>
      <span className="text-3xl font-black w-14 h-14 shrink-0 rounded-2xl bg-white flex items-center justify-center">{n}</span>
      <div>
        <h3 className="font-black text-lg">Ниво {n}: {title}</h3>
        <p className="text-ink/75">{text}</p>
      </div>
    </div>
  )
}
