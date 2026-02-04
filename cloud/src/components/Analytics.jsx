import { useMemo } from 'react'
import { Line, Pie, Doughnut } from 'react-chartjs-2'

export default function Analytics({ data, loading }) {
  const alerts = data.alerts || []

  const trendsData = useMemo(() => {
    // Last 30 days
    const days = []
    const critical = []
    const high = []
    const medium = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      critical.push(alerts.filter(a => {
        const alertTime = new Date(a.created_at)
        return a.severity === 'critical' && alertTime >= dayStart && alertTime <= dayEnd
      }).length)
      
      high.push(alerts.filter(a => {
        const alertTime = new Date(a.created_at)
        return a.severity === 'high' && alertTime >= dayStart && alertTime <= dayEnd
      }).length)
      
      medium.push(alerts.filter(a => {
        const alertTime = new Date(a.created_at)
        return a.severity === 'medium' && alertTime >= dayStart && alertTime <= dayEnd
      }).length)
    }
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Critical',
          data: critical,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'High',
          data: high,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Medium',
          data: medium,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  }, [alerts])

  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    alerts.forEach(a => {
      const sev = (a.severity || 'low').toLowerCase()
      if (counts[sev] !== undefined) counts[sev]++
    })
    
    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.critical, counts.high, counts.medium, counts.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(148, 163, 184, 0.8)'
        ]
      }]
    }
  }, [alerts])

  const ecosystemData = useMemo(() => {
    const ecoCounts = {}
    alerts.forEach(a => {
      const eco = a.package?.ecosystem || 'Unknown'
      ecoCounts[eco] = (ecoCounts[eco] || 0) + 1
    })
    
    return {
      labels: Object.keys(ecoCounts),
      datasets: [{
        data: Object.values(ecoCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }]
    }
  }, [alerts])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' }
      }
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Advanced insights and trends</p>
      </div>

      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">Vulnerability Trends</h3>
          <p className="text-sm text-gray-400">Last 30 days analysis</p>
        </div>
        <div className="h-96">
          <Line data={trendsData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Severity Breakdown</h3>
          </div>
          <div className="h-64">
            <Pie data={severityData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Ecosystem Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut data={ecosystemData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

