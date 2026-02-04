export default function RecentAlerts({ data }) {
  const alerts = (data.alerts || []).slice(-10).reverse()

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Recent Alerts</h3>
          <p className="text-sm text-gray-400">Latest security notifications</p>
        </div>
        <button className="text-sm text-primary-400 hover:text-primary-300 font-medium">
          View All →
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No alerts</div>
        ) : (
          alerts.map((alert, idx) => {
            const sev = (alert.severity || 'low').toLowerCase()
            const sevColors = {
              critical: 'bg-red-500',
              high: 'bg-orange-500',
              medium: 'bg-yellow-500',
              low: 'bg-gray-500'
            }
            
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer">
                <div className={`w-1 h-12 rounded-full ${sevColors[sev] || 'bg-gray-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge badge-${sev}`}>{sev}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {alert.package?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {alert.cve_id || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

