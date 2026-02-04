import { useMemo, useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import TopNav from './components/TopNav'
import Dashboard from './components/Dashboard'
import MasterDashboard from './components/MasterDashboard'
import Machines from './components/Machines'
import Alerts from './components/Alerts'
import Packages from './components/Packages'
import Analytics from './components/Analytics'

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
  const [activeSection, setActiveSection] = useState('dashboard')
  const [scope, setScope] = useState('master') // 'master' | 'machine'
  const [selectedMachineId, setSelectedMachineId] = useState('')
  const [data, setData] = useState({
    alerts: [],
    machines: [],
    packages: new Map()
  })
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    fetchData()
    connectWebSocket()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [scope, selectedMachineId])

  const fetchData = async () => {
    try {
      const urlParams =
        scope === 'machine' && selectedMachineId
          ? `?machine_id=${encodeURIComponent(selectedMachineId)}`
          : ''
      
      const [alertsRes, machinesRes] = await Promise.all([
        fetch(`/alerts${urlParams}`),
        fetch(`/machines${urlParams}`)
      ])
      
      const alerts = await alertsRes.json()
      const machines = await machinesRes.json()
      
      setData({
        alerts: alerts.alerts || [],
        machines: machines.machines || [],
        packages: new Map()
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/agents`
    
    try {
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'CVE_ALERT') {
            fetchData()
          }
        } catch (e) {
          console.error('WebSocket message error:', e)
        }
      }
      
      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connectWebSocket, 5000)
      }
      
      ws.onerror = () => {
        setWsConnected(false)
      }
    } catch (e) {
      console.error('WebSocket connection failed:', e)
      setWsConnected(false)
    }
  }

  const machineOptions = useMemo(() => {
    return (data.machines || []).map(m => ({
      id: m.uuid,
      label: `${m.hostname || 'Unknown'} (${m.uuid?.slice(0, 8)}...)`
    }))
  }, [data.machines])

  // keep a reasonable default selection when switching to machine scope
  useEffect(() => {
    if (scope === 'machine' && !selectedMachineId && machineOptions.length) {
      setSelectedMachineId(machineOptions[0].id)
    }
    if (scope === 'master') {
      setSelectedMachineId('')
    }
  }, [scope, machineOptions, selectedMachineId])

  const ingestNow = async () => {
    try {
      await fetch('/ingest-now', { method: 'POST' })
      await fetchData()
    } catch (e) {
      console.error('ingest-now failed', e)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return scope === 'master'
          ? <MasterDashboard data={data} loading={loading} />
          : <Dashboard data={data} loading={loading} />
      case 'machines':
        return <Machines data={data} loading={loading} />
      case 'alerts':
        return <Alerts data={data} loading={loading} />
      case 'packages':
        return <Packages data={data} loading={loading} machineId={selectedMachineId} scope={scope} />
      case 'analytics':
        return <Analytics data={data} loading={loading} />
      default:
        return scope === 'master'
          ? <MasterDashboard data={data} loading={loading} />
          : <Dashboard data={data} loading={loading} />
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <TopNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        wsConnected={wsConnected}
        alertsCount={data.alerts.length}
        machinesCount={data.machines.length}
        onRefresh={fetchData}
        scope={scope}
        setScope={setScope}
        machineOptions={machineOptions}
        selectedMachineId={selectedMachineId}
        setSelectedMachineId={setSelectedMachineId}
        onIngestNow={ingestNow}
      />
      <main className="container mx-auto px-4 py-8">
        {renderSection()}
      </main>
    </div>
  )
}

export default App

