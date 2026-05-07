export default function RecentAlerts({ data }) {
  const alerts = (data.alerts || []).slice(0, 10)

  return (
    <div className="card h-full flex flex-col border-none shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-950 tracking-tight">Open Findings</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 mt-1">OSV-Backed Remediation Queue</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          {alerts.length} visible
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 min-h-[320px] max-h-[480px]">
        {alerts.length === 0 ? (
          <div className="h-full min-h-[240px] rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-center text-center text-slate-400 px-6">
            No active vulnerabilities are waiting on remediation.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-3xl border border-slate-100 bg-white/80 p-4 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                    <span className="text-sm font-black text-slate-950">{alert.package?.name}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{alert.package?.ecosystem}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {alert.project_name || alert.project_id} · {alert.machine_id}
                  </div>
                </div>
                <a
                  href={`https://osv.dev/vulnerability/${encodeURIComponent(alert.cve_id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                >
                  {alert.cve_id}
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-black text-slate-500">
                  Version {alert.package?.version}
                </span>
                <span className={`rounded-full px-3 py-1.5 font-black ${alert.fix ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {alert.fix ? `Upgrade to ${alert.fix}` : 'No fix published'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
