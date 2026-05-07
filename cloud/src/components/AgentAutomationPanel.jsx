function formatRelativeTime(value) {
  if (!value) return 'Never'
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return 'Unknown'

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatInterval(ms) {
  if (!ms) return 'Disabled'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  return `${Math.round(minutes / 60)}h`
}

export default function AgentAutomationPanel({ agents = [] }) {
  const isAgentOnline = (agent) => {
    const observedAt = new Date(agent.status?.observed_at || agent.last_seen).getTime()
    const recentHeartbeat = Number.isFinite(observedAt) && Date.now() - observedAt < 45000
    return !agent.revoked && (agent.status?.ws_connected || recentHeartbeat)
  }
  const onlineAgents = agents.filter(isAgentOnline)
  const revokedAgents = agents.filter((agent) => agent.revoked)

  return (
    <section className="card border-none shadow-xl shadow-slate-200/40">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-950">Agent Automation</h3>
          <p className="text-sm text-slate-500">Live heartbeat, watcher, and scheduled rescan status from enrolled machines.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            {onlineAgents.length} online
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {agents.length} enrolled
          </span>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-base font-black text-slate-700">No agents enrolled yet.</div>
          <p className="mt-2 text-sm text-slate-400">Run `sentry-agent setup` on another machine and enter this Cloud Brain URL.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.slice(0, 6).map((agent) => {
            const status = agent.status || {}
            const automation = agent.automation || {}
            const isOnline = isAgentOnline(agent)

            return (
              <div key={agent.machine_id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-black text-slate-950">{agent.label || agent.hostname || agent.machine_id}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                        isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {agent.revoked ? 'Revoked' : isOnline ? 'Live' : 'Offline'}
                      </span>
                    </div>
                    <div className="mt-1 break-all text-xs text-slate-500">{agent.machine_id}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                      <div className="font-black uppercase tracking-[0.14em] text-slate-400">Heartbeat</div>
                      <div className="mt-1 font-black text-slate-900">{formatRelativeTime(status.observed_at || agent.last_seen)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                      <div className="font-black uppercase tracking-[0.14em] text-slate-400">Projects</div>
                      <div className="mt-1 font-black text-slate-900">{status.projects || 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                      <div className="font-black uppercase tracking-[0.14em] text-slate-400">Rescan</div>
                      <div className="mt-1 font-black text-slate-900">{formatInterval(automation.rescanIntervalMs)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                      <div className="font-black uppercase tracking-[0.14em] text-slate-400">Last Export</div>
                      <div className="mt-1 font-black text-slate-900">{formatRelativeTime(status.last_export_at || agent.last_export_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {revokedAgents.length > 0 && (
            <div className="text-xs font-bold text-slate-400">{revokedAgents.length} revoked agent token(s) retained for audit history.</div>
          )}
        </div>
      )}
    </section>
  )
}
