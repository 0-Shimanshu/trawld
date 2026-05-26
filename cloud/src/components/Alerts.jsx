import { useMemo, useState } from 'react'
import { acknowledgeAlert, remediateAlert as remediateAlertRequest } from '../api/alerts'

const SEV_STYLE = {
  critical: { badge: 'badge-red'    },
  high:     { badge: 'badge-yellow' },
  medium:   { badge: 'badge-blue'   },
  low:      { badge: 'badge-gray'   },
}

function RemediationLog({ alert }) {
  const result = alert.remediation_result
  const pending = !result && alert.remediation_requested_at

  if (!pending && !result) return null

  if (pending) {
    return (
      <div className="px-4 py-2.5 bg-[#0d1117] border-t border-tr-border font-mono text-[10px] text-tr-dim flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-tr-yellow animate-pulse" />
        Queued — waiting for agent to pick up on next heartbeat…
      </div>
    )
  }

  return (
    <div className="px-4 py-2.5 bg-[#0d1117] border-t border-tr-border font-mono text-[10px]">
      <div className={`flex items-center gap-2 mb-1.5 ${result.success ? 'text-tr-green' : 'text-tr-red'}`}>
        <span>{result.success ? '✓' : '✗'}</span>
        <span>{result.success ? 'Remediation complete' : 'Remediation failed'}</span>
        <span className="text-tr-dim ml-auto">{new Date(result.completed_at).toLocaleTimeString()}</span>
      </div>
      {result.output && (
        <pre className="text-tr-dim whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto">{result.output}</pre>
      )}
      {result.error_message && (
        <pre className="text-tr-red whitespace-pre-wrap break-all leading-relaxed">{result.error_message}</pre>
      )}
    </div>
  )
}

export default function Alerts({ data, loading, onChange }) {
  const [query, setQuery]       = useState('')
  const [severity, setSeverity] = useState('all')
  const [busyId, setBusyId]     = useState('')

  const alerts = useMemo(() => {
    return (data?.alerts || []).filter((alert) => {
      const matchesQuery = query.trim() === '' || [
        alert.package?.name, alert.cve_id, alert.project_name, alert.machine_id, alert.package?.version,
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(query.toLowerCase()))
      const matchesSeverity = severity === 'all' || alert.severity === severity
      return matchesQuery && matchesSeverity
    })
  }, [data?.alerts, query, severity])

  const activeFindings  = useMemo(() => alerts.filter((a) => a.status !== 'ack').length, [alerts])
  const autoUpdateReady = useMemo(() => alerts.filter((a) => a.fix && a.status !== 'ack').length, [alerts])

  const ackAlert = async (id) => {
    try { await acknowledgeAlert(id); onChange?.() }
    catch (error) { console.error('Failed to acknowledge alert:', error) }
  }

  const remediateAlert = async (id) => {
    try { setBusyId(id); await remediateAlertRequest(id); onChange?.() }
    catch (error) { console.error('Failed to queue remediation:', error) }
    finally { setBusyId('') }
  }

  return (
    <>
      {/* Topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-tr-border bg-tr-bg/90 backdrop-blur">
        <div>
          <h1 className="text-[14px] font-semibold text-tr-text">Alerts</h1>
          <p className="text-[11px] text-tr-dim">{activeFindings} active findings</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Filters + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <input
            className="input w-full sm:w-64"
            placeholder="Search package, CVE, project…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="select w-full sm:w-auto"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="hidden sm:flex sm:ml-auto gap-4 text-[11px] text-tr-dim">
            <span><span className="text-tr-text font-semibold">{alerts.length}</span> in view</span>
            <span><span className="text-tr-text font-semibold">{activeFindings}</span> active</span>
            <span><span className="text-tr-text font-semibold">{autoUpdateReady}</span> auto-update ready</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-[12px] text-tr-dim py-8">Loading…</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px] text-[12px]">
              <thead>
                <tr className="border-b border-tr-border">
                  {['Severity', 'Package', 'Scope', 'CVE', 'Fix', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] text-tr-dim uppercase tracking-[0.5px] font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-tr-border">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-tr-dim text-center">No alerts match your filters.</td>
                  </tr>
                ) : (
                  alerts.map((a) => {
                    const sev = SEV_STYLE[a.severity] || SEV_STYLE.low
                    const hasLog = a.remediation_result || a.remediation_requested_at
                    return (
                      <>
                        <tr key={a.id} className="hover:bg-[#1c2128] transition-colors">
                          <td className="px-4 py-2.5">
                            <span className={`status-badge ${sev.badge}`}>{a.severity || '—'}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-tr-text font-medium">{a.package?.name}</p>
                            <p className="text-[10px] text-tr-dim">{a.package?.ecosystem} · v{a.package?.version}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-tr-text">{a.project_name || a.project_id}</p>
                            <p className="text-[10px] text-tr-dim">{a.machine_id}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-tr-blue font-mono text-[10px]">{a.cve_id || a.osv_id || '—'}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-tr-muted text-[10px]">{a.fix || '—'}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1.5">
                              {a.fix && a.status !== 'ack' && (
                                <button
                                  className="btn text-[10px] py-1 px-2"
                                  disabled={busyId === a.id}
                                  onClick={() => remediateAlert(a.id)}
                                >
                                  {busyId === a.id ? '…' : 'Auto Update'}
                                </button>
                              )}
                              {a.status !== 'ack' && (
                                <button
                                  className="btn text-[10px] py-1 px-2"
                                  onClick={() => ackAlert(a.id)}
                                >
                                  Resolve
                                </button>
                              )}
                              {a.status === 'ack' && (
                                <span className="text-[10px] text-tr-dim">Resolved</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        {hasLog && (
                          <tr key={`${a.id}-log`}>
                            <td colSpan={6} className="p-0">
                              <RemediationLog alert={a} />
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
