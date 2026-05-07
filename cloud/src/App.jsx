import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import AppShell from './layouts/AppShell'
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
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
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
