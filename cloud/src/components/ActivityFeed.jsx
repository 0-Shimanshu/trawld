export default function ActivityFeed({ data }) {
  const activities = []
  
  // Generate activities from alerts
  const alerts = (data.alerts || []).slice(-10).reverse()
  alerts.forEach(a => {
    activities.push({
      type: 'alert',
      icon: 'exclamation-triangle',
      title: `New ${a.severity} vulnerability detected`,
      desc: `${a.package?.name || 'Unknown'} - ${a.cve_id || 'N/A'}`,
      time: new Date(a.created_at)
    })
  })

  // Generate activities from machines
  const machines = data.machines || []
  machines.forEach(m => {
    const lastSeen = new Date(m.last_seen)
    if ((Date.now() - lastSeen.getTime()) / 1000 < 300) {
      activities.push({
        type: 'machine',
        icon: 'server',
        title: `Machine ${m.hostname} is online`,
        desc: `Last seen: ${lastSeen.toLocaleString()}`,
        time: lastSeen
      })
    }
  })

  activities.sort((a, b) => b.time - a.time)
  activities.splice(10)

  const getTimeAgo = (date) => {
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Recent Activity</h3>
          <p className="text-sm text-gray-400">Live system events</p>
        </div>
        <input 
          type="text" 
          className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary-500"
          placeholder="Search..."
        />
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent activity</div>
        ) : (
          activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activity.type === 'alert' 
                  ? 'bg-red-500/20 text-red-400'
                  : activity.type === 'machine'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                <i className={`fas fa-${activity.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white mb-1">{activity.title}</div>
                <div className="text-xs text-gray-400 mb-1">{activity.desc}</div>
                <div className="text-xs text-gray-500">{getTimeAgo(activity.time)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

