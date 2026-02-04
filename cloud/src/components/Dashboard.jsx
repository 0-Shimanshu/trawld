import { useMemo } from 'react'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import MetricCard from './MetricCard'
import ActivityFeed from './ActivityFeed'
import RecentAlerts from './RecentAlerts'

export default function Dashboard({ data, loading }) {
  const stats = useMemo(() => {
    const alerts = data.alerts || []
    const machines = data.machines || []
    
    const onlineMachines = machines.filter(m => {
      const lastSeen = new Date(m.last_seen)
      return (Date.now() - lastSeen.getTime()) / 1000 < 65
    }).length

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    
    const uniquePackages = new Set(
      alerts.map(a => `${a.package?.ecosystem}:${a.package?.name}`)
    ).size

    const riskScore = Math.min(100, alerts.reduce((score, a) => {
      const weights = { critical: 10, high: 5, medium: 2, low: 1 }
      return score + (weights[a.severity] || 0)
    }, 0))

    return {
      machines: onlineMachines,
      alerts: alerts.length,
      critical: criticalAlerts,
      packages: uniquePackages,
      processes: machines.length,
      risk: riskScore
    }
  }, [data])

  const severityData = useMemo(() => {
    const alerts = data.alerts || []
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
        ],
        borderWidth: 0
      }]
    }
  }, [data.alerts])

  const timelineData = useMemo(() => {
    const alerts = data.alerts || []
    const now = new Date()
    const hours = []
    const counts = []
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      hours.push(hour.getHours() + ':00')
      const hourStart = new Date(hour.setMinutes(0, 0, 0))
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
      const count = alerts.filter(a => {
        const alertTime = new Date(a.created_at)
        return alertTime >= hourStart && alertTime < hourEnd
      }).length
      counts.push(count)
    }
    
    return {
      labels: hours,
      datasets: [{
        label: 'Alerts',
        data: counts,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }
  }, [data.alerts])

  const ecosystemData = useMemo(() => {
    const alerts = data.alerts || []
    const ecoCounts = {}
    alerts.forEach(a => {
      const eco = a.package?.ecosystem || 'Unknown'
      ecoCounts[eco] = (ecoCounts[eco] || 0) + 1
    })
    
    return {
      labels: Object.keys(ecoCounts),
      datasets: [{
        label: 'Vulnerabilities',
        data: Object.values(ecoCounts),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8
      }]
    }
  }, [data.alerts])

  const packagesData = useMemo(() => {
    const alerts = data.alerts || []
    const pkgCounts = {}
    alerts.forEach(a => {
      const pkg = a.package?.name || 'Unknown'
      pkgCounts[pkg] = (pkgCounts[pkg] || 0) + 1
    })
    const sorted = Object.entries(pkgCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    
    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: 'Vulnerabilities',
        data: sorted.map(([, count]) => count),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8
      }]
    }
  }, [data.alerts])

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
    return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Real-time vulnerability monitoring and threat detection</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <i className="fas fa-download mr-2"></i>
            Export Data
          </button>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                await fetch('/demo/seed-alert', { method: 'POST' })
                // lightweight hint: rely on polling / websocket to pull new data
                window.location.reload()
              } catch (err) {
                console.error('demo/seed-alert failed', err)
              }
            }}
          >
            <button type="submit" className="btn-primary">
              <i className="fas fa-flask mr-2"></i>
              Seed Demo Alert
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon="server"
          iconBg="from-blue-500 to-purple-600"
          value={stats.machines}
          label="Active Machines"
          trend="+2"
          trendType="positive"
          detail="Across all environments"
        />
        <MetricCard
          icon="exclamation-triangle"
          iconBg="from-pink-500 to-red-500"
          value={stats.alerts}
          label="Security Alerts"
          trend="+5"
          trendType="negative"
          detail="Requires attention"
        />
        <MetricCard
          icon="skull"
          iconBg="from-red-500 to-orange-500"
          value={stats.critical}
          label="Critical Vulnerabilities"
          trend="+1"
          trendType="negative"
          detail="Immediate action required"
          critical
        />
        <MetricCard
          icon="box"
          iconBg="from-cyan-500 to-blue-500"
          value={stats.packages}
          label="Monitored Packages"
          trend="0"
          detail="Across all ecosystems"
        />
        <MetricCard
          icon="shield-alt"
          iconBg="from-green-500 to-teal-500"
          value={stats.processes}
          label="Protected Processes"
          trend="+3"
          trendType="positive"
          detail="Currently monitored"
        />
        <MetricCard
          icon="chart-line"
          iconBg="from-yellow-500 to-orange-500"
          value={stats.risk}
          label="Overall Risk Score"
          trend="+5%"
          detail={`${stats.risk}% risk level`}
          showProgress
          progress={stats.risk}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Vulnerability Distribution</h3>
              <p className="text-sm text-gray-400">Severity breakdown across all alerts</p>
            </div>
          </div>
          <div className="h-64">
            <Doughnut data={severityData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Alert Timeline</h3>
              <p className="text-sm text-gray-400">Alerts detected over time</p>
            </div>
          </div>
          <div className="h-64">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Ecosystem Analysis</h3>
              <p className="text-sm text-gray-400">Vulnerabilities by package ecosystem</p>
            </div>
          </div>
          <div className="h-64">
            <Bar data={ecosystemData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Top Vulnerable Packages</h3>
              <p className="text-sm text-gray-400">Most affected packages</p>
            </div>
          </div>
          <div className="h-64">
            <Bar data={packagesData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed data={data} />
        <RecentAlerts data={data} />
      </div>
    </div>
  )
}

