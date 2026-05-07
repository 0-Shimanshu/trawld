import { useMemo } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import MetricCard from './MetricCard'
import ActivityFeed from './ActivityFeed'
import RecentAlerts from './RecentAlerts'

export default function Dashboard({ data, loading, machine, onScanMachine }) {
  const stats = useMemo(() => {
    const alerts = data.alerts || []
    const packages = data.packages || []
    const projects = data.projects || []
    const risk = Math.min(100, alerts.reduce((score, alert) => {
      const weights = { critical: 16, high: 8, medium: 4, low: 1 }
      return score + (weights[alert.severity] || 0)
    }, 0))

    return {
      projects: projects.length,
      packages: packages.length,
      alerts: alerts.length,
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
        borderWidth: 0,
        hoverOffset: 14
      }]
    }
  }, [data.alerts])

  const projectRiskData = useMemo(() => {
    const projects = (data.projects || []).slice(0, 8)
    return {
      labels: projects.map((project) => project.label || project.name),
      datasets: [{
        label: 'Open Alerts',
        data: projects.map((project) => project.alert_count || 0),
        backgroundColor: 'rgba(37, 99, 235, 0.78)',
        borderRadius: 12
      }]
    }
  }, [data.projects])

  const timelineData = useMemo(() => {
    const alerts = data.alerts || []
    const labels = []
    const points = []

    for (let index = 23; index >= 0; index -= 1) {
      const hour = new Date(Date.now() - index * 60 * 60 * 1000)
      const hourStart = new Date(hour)
      hourStart.setMinutes(0, 0, 0)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

      labels.push(hourStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      points.push(alerts.filter((alert) => {
        const seen = new Date(alert.updated_at || alert.created_at)
        return seen >= hourStart && seen < hourEnd
      }).length)
    }

    return {
      labels,
      datasets: [{
        label: 'Findings',
        data: points,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.35
      }]
    }
  }, [data.alerts])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Loading machine telemetry...</p>
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
        ticks: { color: '#64748b', maxRotation: 0, minRotation: 0 }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: { color: '#64748b', precision: 0, stepSize: 1 }
      }
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.85fr] gap-8">
        <div className="rounded-[32px] border border-slate-200/70 bg-[linear-gradient(140deg,_rgba(15,23,42,0.98),_rgba(37,99,235,0.92))] p-8 text-white shadow-[0_28px_60px_-32px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                Machine Scope
              </div>
              <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight">{machine?.hostname || 'Selected Machine'}</h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-blue-50/80">
                Project-scoped runtime signals, manifest watcher snapshots, and OSV-backed remediation data are streamed into this machine view in realtime.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-4 py-2 font-black">{machine?.os || 'Unknown OS'}</span>
                <span className="rounded-full bg-white/10 px-4 py-2 font-black">{stats.projects} projects</span>
                <span className="rounded-full bg-white/10 px-4 py-2 font-black">{stats.packages} packages</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={onScanMachine} className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                <i className="fas fa-shield-heart"></i>
                <span>Rescan Machine</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Tracked Projects</h3>
              <p className="text-sm text-slate-500">Snapshot watchers and runtime hooks active on this endpoint</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {stats.projects} total
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {(data.projects || []).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                No monitored projects have reported from this machine yet.
              </div>
            ) : (
              (data.projects || []).map((project) => (
                <div key={project.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-950">{project.label || project.name}</div>
                      <div className="mt-1 text-xs text-slate-500 truncate">{project.root}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 border border-slate-200">
                      {project.last_source}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1.5 font-black text-slate-600 border border-slate-200">{project.package_count || 0} packages</span>
                    <span className="rounded-full bg-rose-50 px-3 py-1.5 font-black text-rose-600 border border-rose-100">{project.alert_count || 0} open alerts</span>
                    {(project.ecosystems || []).map((ecosystem) => (
                      <span key={ecosystem} className="rounded-full bg-indigo-50 px-3 py-1.5 font-black text-indigo-600 border border-indigo-100">
                        {ecosystem}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon="folder-tree" iconBg="bg-indigo-50 text-indigo-600" value={stats.projects} label="Watched Projects" detail="Project Boundaries" />
        <MetricCard icon="triangle-exclamation" iconBg="bg-rose-50 text-rose-600" value={stats.alerts} label="Open Findings" detail="OSV Matched" />
        <MetricCard icon="shield-halved" iconBg="bg-amber-50 text-amber-600" value={stats.risk} label="Machine Risk" detail="Risk Score" showProgress progress={stats.risk} />
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Findings Timeline</h3>
            <p className="text-sm text-slate-500">Hourly alert churn over the last 24 hours for this machine.</p>
          </div>
          <div className="h-[300px] sm:h-[360px]">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Severity Mix</h3>
            <p className="text-sm text-slate-500">How the current machine findings break down by urgency.</p>
          </div>
          <div className="h-[300px] sm:h-[360px]">
            <Doughnut data={severityData} options={{ ...chartOptions, cutout: '68%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Project Risk Ranking</h3>
            <p className="text-sm text-slate-500">Open findings grouped by project to surface the riskiest project roots first.</p>
          </div>
          <div className="h-[320px] sm:h-[360px]">
            <Bar data={projectRiskData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
        <RecentAlerts data={data} />
      </div>

      <div className="pt-2">
        <ActivityFeed data={data} />
      </div>
    </div>
  )
}
