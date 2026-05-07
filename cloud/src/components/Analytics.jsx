import { useMemo } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

export default function Analytics({ data, loading }) {
  const alerts = data?.alerts || []
  const projects = data?.projects || []
  const packages = data?.packages || []

  const timelineData = useMemo(() => {
    const labels = []
    const critical = []
    const total = []

    for (let index = 13; index >= 0; index -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - index)
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)

      labels.push(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      const matching = alerts.filter((alert) => {
        const seen = new Date(alert.updated_at || alert.created_at)
        return seen >= start && seen <= end
      })
      total.push(matching.length)
      critical.push(matching.filter((alert) => alert.severity === 'critical').length)
    }

    return {
      labels,
      datasets: [
        {
          label: 'All Findings',
          data: total,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Critical Findings',
          data: critical,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          fill: true,
          tension: 0.35
        }
      ]
    }
  }, [alerts])

  const ecosystemData = useMemo(() => {
    const counts = {}
    for (const pkg of packages) {
      counts[pkg.ecosystem] = (counts[pkg.ecosystem] || 0) + 1
    }
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#2563eb', '#10b981', '#f97316', '#8b5cf6'],
        borderWidth: 0
      }]
    }
  }, [packages])

  const projectPressureData = useMemo(() => {
    const ranked = projects
      .slice()
      .sort((left, right) => (right.alert_count || 0) - (left.alert_count || 0))
      .slice(0, 8)

    return {
      labels: ranked.map((project) => project.label || project.name),
      datasets: [{
        label: 'Open Alerts',
        data: ranked.map((project) => project.alert_count || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.78)',
        borderRadius: 12
      }]
    }
  }, [projects])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Preparing analytics...</p>
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
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Security Analytics</h1>
        <p className="mt-2 text-slate-500">Trend the velocity of project-level findings, compare ecosystem exposure, and see which projects are absorbing the most risk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Projects In View</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{projects.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Packages In View</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{packages.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Active Findings</div>
          <div className="mt-2 text-3xl font-black text-rose-600">{alerts.length}</div>
        </div>
      </div>

      <div className="card border-none shadow-xl shadow-slate-200/40">
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-950 tracking-tight">14-Day Findings Trend</h3>
          <p className="text-sm text-slate-500">See whether fleet pressure is expanding through more alerts or becoming concentrated in critical incidents.</p>
        </div>
        <div className="h-[360px] sm:h-[420px]">
          <Line data={timelineData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Ecosystem Coverage</h3>
            <p className="text-sm text-slate-500">Break down the current package inventory by ecosystem.</p>
          </div>
          <div className="h-[320px] sm:h-[360px]">
            <Doughnut data={ecosystemData} options={{ ...chartOptions, cutout: '68%' }} />
          </div>
        </div>

        <div className="card border-none shadow-xl shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">Most Pressured Projects</h3>
            <p className="text-sm text-slate-500">Projects with the highest current open-alert counts.</p>
          </div>
          <div className="h-[320px] sm:h-[360px]">
            <Bar data={projectPressureData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
