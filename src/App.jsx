import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav, CrisisModal, DemoBanner, Footer, Header, HelpButton } from './components/Layout'
import Landing from './pages/Landing'
import About from './pages/About'
import AppHome from './pages/AppHome'
import Chat from './pages/Chat'
import { ArticleList, ArticlePage } from './pages/Articles'
import { QuizList, QuizPage } from './pages/Quizzes'
import Register from './pages/Register'
import Community from './pages/Community'
import Booking from './pages/Booking'
import PsychDashboard from './pages/PsychDashboard'
import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <DemoBanner />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/app" element={<AppHome />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/help" element={<ArticleList />} />
          <Route path="/help/:id" element={<ArticlePage />} />
          <Route path="/quiz" element={<QuizList />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/community" element={<Community />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/psych" element={<PsychDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <HelpButton />
      <BottomNav />
      <CrisisModal />
    </div>
  )
}
