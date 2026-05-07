import { useMemo, useState } from 'react'
import { acknowledgeAlert, remediateAlert as remediateAlertRequest } from '../api/alerts'

export default function Alerts({ data, loading, onChange }) {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [busyId, setBusyId] = useState('')

  const alerts = useMemo(() => {
    return (data.alerts || []).filter((alert) => {
      const matchesQuery = query.trim() === '' || [
        alert.package?.name,
        alert.cve_id,
        alert.project_name,
        alert.machine_id,
        alert.package?.version
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query.trim().toLowerCase()))

      const matchesSeverity = severity === 'all' || alert.severity === severity
      return matchesQuery && matchesSeverity
    })
  }, [data.alerts, query, severity])

  const activeFindings = useMemo(() => alerts.filter((alert) => alert.status !== 'ack').length, [alerts])
  const autoUpdateReady = useMemo(() => alerts.filter((alert) => alert.fix && alert.status !== 'ack').length, [alerts])

  const ackAlert = async (id) => {
    try {
      await acknowledgeAlert(id)
      onChange?.()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const remediateAlert = async (id) => {
    try {
      setBusyId(id)
      await remediateAlertRequest(id)
      onChange?.()
    } catch (error) {
      console.error('Failed to queue remediation:', error)
    } finally {
      setBusyId('')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Alerts & Remediation</h1>
          <p className="mt-2 text-slate-500">Track every OSV match with project context, then trigger automatic updates through the matching package manager when a fix exists.</p>
        </div>

        <div className="soft-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[280px]">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="Search package, CVE, project, or machine..."
              />
            </div>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-5">
        <div className="soft-panel px-6 py-5">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Alerts In View</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <div className="text-4xl font-black tracking-tight text-slate-950">{alerts.length}</div>
              <div className="mt-1 text-sm text-slate-500">results after search and severity filtering</div>
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-rose-600">{activeFindings}</div>
              <div className="mt-1 text-sm text-slate-500">still open and awaiting action</div>
            </div>
          </div>
        </div>

        <div className="soft-panel px-6 py-5">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Automatic Updates</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <div className="text-4xl font-black tracking-tight text-emerald-600">{autoUpdateReady}</div>
              <div className="mt-1 text-sm text-slate-500">alerts have a fix version ready to apply</div>
            </div>
            <p className="max-w-sm text-sm text-slate-500">
              Auto Update uses the project&apos;s package manager and then triggers a fresh project snapshot after the change.
            </p>
          </div>
        </div>
      </div>

      <div className="card !p-0 border-none shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1080px]">
            <div className="grid grid-cols-[0.55fr_0.9fr_1.2fr_0.7fr_0.75fr_0.75fr_0.8fr] bg-slate-50/90 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              <div className="px-7 py-4">Severity</div>
              <div className="px-7 py-4">Package</div>
              <div className="px-7 py-4">Scope</div>
              <div className="px-7 py-4">OSV</div>
              <div className="px-7 py-4">Fix</div>
              <div className="px-7 py-4">Updated</div>
              <div className="px-7 py-4">Actions</div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
              {alerts.length === 0 ? (
                <div className="px-7 py-28 text-center text-slate-400">No alerts matched your search and severity filters.</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="grid grid-cols-[0.55fr_0.9fr_1.2fr_0.7fr_0.75fr_0.75fr_0.8fr] hover:bg-slate-50/60 transition-colors">
                    <div className="px-7 py-6">
                      <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                    </div>
                    <div className="px-7 py-6">
                      <div className="text-sm font-black text-slate-950">{alert.package?.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{alert.package?.ecosystem} · {alert.package?.version}</div>
                    </div>
                    <div className="px-7 py-6">
                      <div className="text-sm font-black text-slate-950">{alert.project_name || alert.project_id}</div>
                      <div className="mt-1 text-xs text-slate-500">{alert.machine_id}</div>
                      <div className="mt-2 text-xs text-slate-500 break-all">{alert.project_root}</div>
                    </div>
                    <div className="px-7 py-6">
                      <a
                        href={`https://osv.dev/vulnerability/${encodeURIComponent(alert.cve_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                      >
                        <span>{alert.cve_id}</span>
                        <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>
                    </div>
                    <div className="px-7 py-6">
                      {alert.fix ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 border border-emerald-100">{alert.fix}</span>
                      ) : (
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">No fix</span>
                      )}
                    </div>
                    <div className="px-7 py-6">
                      <div className="text-sm font-black text-slate-950">{new Date(alert.updated_at || alert.created_at).toLocaleDateString()}</div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(alert.updated_at || alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="px-7 py-6">
                      <div className="flex flex-col items-start gap-2">
                        {alert.fix && alert.status !== 'ack' && (
                          <button
                            onClick={() => remediateAlert(alert.id)}
                            disabled={busyId === alert.id}
                            className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-100 transition-colors ${busyId === alert.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {busyId === alert.id ? 'Updating…' : 'Auto Update'}
                          </button>
                        )}
                        {alert.status === 'ack' ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 border border-slate-200">Resolved</span>
                        ) : (
                          <button onClick={() => ackAlert(alert.id)} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 hover:bg-amber-100 transition-colors">
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
