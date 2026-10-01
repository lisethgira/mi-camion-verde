import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import PWABadge from './PWABadge'
import Home from './pages/Home'
import Horarios from './pages/Horarios'
import Novedades from './pages/Novedades'
import Cuenta from './pages/Cuenta'
import BarrioSelect from './pages/BarrioSelect'
import { getBarrioGuardado } from './lib/utils'

export default function App() {
  const [barrio, setBarrio] = useState(getBarrioGuardado)
  const navigate = useNavigate()

  useEffect(() => {
    const onStorage = () => setBarrio(getBarrioGuardado())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleSelectBarrio(b) {
    setBarrio(b)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header barrio={barrio} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-10">
        <Routes>
          <Route path="/" element={<Home barrio={barrio} />} />
          <Route path="/horarios" element={<Horarios barrio={barrio} />} />
          <Route path="/novedades" element={<Novedades />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/barrio" element={<BarrioSelect onSelect={handleSelectBarrio} />} />
        </Routes>
      </main>
      <BottomNav />
      <PWABadge />
    </div>
  )
}
