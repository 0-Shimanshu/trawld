import { useMemo } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import MetricCard from './MetricCard'
import ActivityFeed from './ActivityFeed'
import RecentAlerts from './RecentAlerts'
import AgentAutomationPanel from './AgentAutomationPanel'

export default function MasterDashboard({ data, loading, onScanAll }) {
  const stats = useMemo(() => {
    const alerts = data.alerts || []
    const machines = data.machines || []
    const projects = data.projects || []
    const packages = data.packages || []
    const onlineMachines = machines.filter((machine) => {
      const seen = new Date(machine.last_seen)
      return (Date.now() - seen.getTime()) / 1000 < 120
    }).length

    const risk = Math.min(100, alerts.reduce((score, alert) => {
      const weights = { critical: 14, high: 7, medium: 3, low: 1 }
      return score + (weights[alert.severity] || 0)
    }, 0))

    return {
      machines: onlineMachines,
      totalMachines: machines.length,
      projects: projects.length,
      packages: packages.length,
      alerts: alerts.length,
      critical: alerts.filter((alert) => alert.severity === 'critical').length,
      risk
    }
  }, [data])

  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const alert of data.alerts || []) {
      const severity = (alert.severity || 'low').toLowerCase()
      if (counts[severity] !== undefined) counts[severity] += 1
    }
    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.critical, counts.high, counts.medium, counts.low],
        backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#94a3b8'],
        borderWidth: 0
      }]
    }
  }, [data.alerts])

  const projectData = useMemo(() => {
    const projects = (data.projects || []).slice(0, 10)
    return {
      labels: projects.map((project) => project.label || project.name),
      datasets: [{
        label: 'Packages',
        data: projects.map((project) => project.package_count || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.78)',
        borderRadius: 12
      }, {
        label: 'Open Alerts',
        data: projects.map((project) => project.alert_count || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.78)',
        borderRadius: 12
      }]
    }
  }, [data.projects])

  const machineHealth = useMemo(() => {
    const machines = data.machines || []
    const online = machines.filter((machine) => {
      const seen = new Date(machine.last_seen)
      return (Date.now() - seen.getTime()) / 1000 < 120
    }).length
    const offline = Math.max(0, machines.length - online)
    return {
      labels: ['Online', 'Offline'],
      datasets: [{
        data: [online, offline],
        backgroundColor: ['#10b981', '#cbd5e1'],
        borderWidth: 0
      }]
    }
  }, [data.machines])

  const timelineData = useMemo(() => {
    const alerts = data.alerts || []
    const labels = []
    const points = []
    for (let index = 23; index >= 0; index -= 1) {
      const hour = new Date(Date.now() - index * 60 * 60 * 1000)
      const start = new Date(hour)
      start.setMinutes(0, 0, 0)
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      labels.push(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      points.push(alerts.filter((alert) => {
        const seen = new Date(alert.updated_at || alert.created_at)
        return seen >= start && seen < end
      }).length)
    }
    return {
      labels,
      datasets: [{
        label: 'Fleet Findings',
        data: points,
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
        fill: true,
        tension: 0.35
      }]
    }
  }, [data.alerts])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Loading fleet telemetry...</p>
      </div>
    )
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748b', usePointStyle: true, padding: 18 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: { color: '#64748b', precision: 0, stepSize: 1 }
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[32px] border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(219,234,254,0.96))] p-8 shadow-[0_28px_60px_-34px_rgba(37,99,235,0.35)]">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Fleet Overview
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Realtime Package Exposure Across Every Connected Project</h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              The fleet dashboard tracks machine heartbeats, project snapshots, raw package inventories, and OSV-backed remediation guidance without falling back to system-wide scans.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={onScanAll} className="btn-secondary">
              <i className="fas fa-radar"></i>
              <span>Rescan Fleet</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard icon="desktop" iconBg="bg-blue-50 text-blue-600" value={stats.machines} label="Online Machines" detail={`${stats.totalMachines} registered`} />
        <MetricCard icon="folder-tree" iconBg="bg-indigo-50 text-indigo-600" value={stats.projects} label="Tracked Projects" detail="Project Registry" />
        <MetricCard icon="triangle-exclamation" iconBg="bg-rose-50 text-rose-600" value={stats.alerts} label="Open Findings" detail="OSV Matches" critical={stats.critical > 0} />
        <MetricCard icon="shield-halved" iconBg="bg-amber-50 text-amber-600" value={stats.risk} label="Fleet Risk" detail="Risk Score" showProgress progress={stats.risk} />
      </div>

      <AgentAutomationPanel agents={data.agents || []} />

      <div className="grid grid-cols-1 2xl:grid-cols-[1.25fr_0.75fr] gap-8">
        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Fleet Findings Timeline</h3>
            <p className="text-sm text-slate-500">How quickly new vulnerable package states are being observed across the fleet.</p>
          </div>
          <div className="h-[320px] sm:h-[380px]">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Machine Health</h3>
            <p className="text-sm text-slate-500">Heartbeat visibility from endpoints running the local agent.</p>
          </div>
          <div className="h-[320px] sm:h-[380px]">
            <Doughnut data={machineHealth} options={{ ...chartOptions, cutout: '72%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1fr_1fr] gap-8">
        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Project Inventory Pressure</h3>
            <p className="text-sm text-slate-500">Compare package volume with current open findings by project root.</p>
          </div>
          <div className="h-[340px] sm:h-[380px]">
            <Bar data={projectData} options={chartOptions} />
          </div>
        </div>

        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Severity Distribution</h3>
            <p className="text-sm text-slate-500">The current fleet-wide spread of OSV findings by severity level.</p>
          </div>
          <div className="h-[340px] sm:h-[380px]">
            <Doughnut data={severityData} options={{ ...chartOptions, cutout: '68%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.05fr_0.95fr] gap-8">
        <ActivityFeed data={data} />
        <RecentAlerts data={data} />
      </div>
    </div>
  )
}
