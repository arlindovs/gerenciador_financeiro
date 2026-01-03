import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Charts from './pages/Charts'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route element={<Layout />}>
          <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={session ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/categories" element={session ? <Categories /> : <Navigate to="/login" />} />
          <Route path="/charts" element={session ? <Charts /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
