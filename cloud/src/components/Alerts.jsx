export default function Alerts({ data, loading }) {
  const alerts = (data.alerts || []).slice().reverse()

  const ackAlert = async (id) => {
    try {
      await fetch(`/alerts/${encodeURIComponent(id)}/ack`, { method: 'POST' })
      // soft refresh
      window.location.reload()
    } catch (e) {
      console.error('ack failed', e)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading alerts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
          <p className="text-gray-400">Complete alert history and management</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary-500"
            placeholder="Search alerts..."
          />
          <select className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-primary-500">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn-secondary">
            <i className="fas fa-download mr-2"></i>
            Export
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Package</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CVE ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Machine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fix Available</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">No alerts found</td>
                </tr>
              ) : (
                alerts.map((alert, idx) => {
                  const sev = (alert.severity || 'low').toLowerCase()
                  const status = alert.status || 'open'
                  return (
                    <tr key={idx} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`badge badge-${sev}`}>{sev}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-300">
                          {alert.package?.ecosystem || ''}:{alert.package?.name || ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{alert.package?.version || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-300">{alert.cve_id || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-400" title={alert.machine_id}>
                          {alert.machine_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{alert.fix || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold ${status === 'ack' ? 'text-green-400' : 'text-gray-500'}`}>
                            {status.toUpperCase()}
                          </span>
                          {status !== 'ack' && alert.id && (
                            <button
                              className="text-yellow-400 hover:text-yellow-300"
                              onClick={() => ackAlert(alert.id)}
                              title="Acknowledge"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

