export default function ActivityFeed({ data }) {
  const activities = []

  for (const alert of (data.alerts || []).slice(0, 10)) {
    activities.push({
      type: 'alert',
      icon: 'triangle-exclamation',
      title: `${alert.severity} vulnerability detected`,
      desc: `${alert.project_name || alert.project_id} · ${alert.package?.name}@${alert.package?.version}`,
      time: new Date(alert.updated_at || alert.created_at)
    })
  }

  for (const project of (data.projects || []).slice(0, 8)) {
    activities.push({
      type: 'project',
      icon: 'folder-tree',
      title: `${project.label || project.name} inventory updated`,
      desc: `${project.package_count || 0} packages · ${project.alert_count || 0} open alerts`,
      time: new Date(project.last_seen)
    })
  }

  for (const machine of (data.machines || []).slice(0, 8)) {
    activities.push({
      type: 'machine',
      icon: 'desktop',
      title: `${machine.hostname || machine.uuid} heartbeat received`,
      desc: `${machine.project_count || 0} projects · ${machine.package_count || 0} packages`,
      time: new Date(machine.last_seen)
    })
  }

  activities.sort((left, right) => right.time - left.time)
  const visible = activities.slice(0, 12)

  const getTimeAgo = (date) => {
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="card h-full flex flex-col border-none shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-950 tracking-tight">Live Event Stream</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 mt-1">Machine, Project, And Vulnerability Activity</p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
          Realtime
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 min-h-[320px] max-h-[480px]">
        {visible.length === 0 ? (
          <div className="h-full min-h-[240px] rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-center text-center text-slate-400 px-6">
            Listening for machine heartbeats, snapshot updates, and OSV findings.
          </div>
        ) : (
          visible.map((activity, index) => (
            <div key={`${activity.type}-${index}`} className="flex gap-4 rounded-3xl border border-slate-100 bg-white/80 p-4 hover:border-slate-200 transition-colors">
              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
                activity.type === 'alert'
                  ? 'bg-rose-50 text-rose-600'
                  : activity.type === 'project'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                <i className={`fas fa-${activity.icon}`}></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-black text-slate-950">{activity.title}</div>
                  <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {getTimeAgo(activity.time)}
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-500">{activity.desc}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
