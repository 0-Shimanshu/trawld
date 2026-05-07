import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getCurrentUser } from './api/auth'
import AppShell from './layouts/AppShell'
import LoginPage from './components/LoginPage'
import OverviewPage from './pages/OverviewPage'
import MachinesPage from './pages/MachinesPage'
import MachineDetailPage from './pages/MachineDetailPage'
import AlertsPage from './pages/AlertsPage'
import PackagesPage from './pages/PackagesPage'
import AnalyticsPage from './pages/AnalyticsPage'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let disposed = false
    getCurrentUser()
      .then((nextSession) => {
        if (!disposed) setSession(nextSession)
      })
      .catch(() => {
        if (!disposed) setSession(null)
      })
      .finally(() => {
        if (!disposed) setCheckingSession(false)
      })

    return () => {
      disposed = true
    }
  }, [])

  if (checkingSession) {
    return (
      <div className="app-canvas flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Checking session</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onAuthenticated={setSession} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell session={session} onLogout={() => setSession(null)} />}>
          <Route index element={<OverviewPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
