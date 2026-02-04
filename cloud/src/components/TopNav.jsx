
export default function TopNav({
  activeSection,
  setActiveSection,
  wsConnected,
  alertsCount,
  machinesCount,
  onRefresh,
  scope,
  setScope,
  machineOptions,
  selectedMachineId,
  setSelectedMachineId,
  onIngestNow
}) {
  const navItems = [
    { id: 'dashboard', icon: 'chart-pie', label: scope === 'master' ? 'Master Dashboard' : 'Machine Dashboard' },
    { id: 'machines', icon: 'server', label: 'Machines', badge: machinesCount },
    { id: 'alerts', icon: 'bell', label: 'Alerts', badge: alertsCount, badgeType: 'alert' },
    { id: 'packages', icon: 'boxes', label: 'Packages' },
    { id: 'analytics', icon: 'chart-line', label: 'Analytics' },
  ]

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-white">VulnPkg</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Security Platform</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeSection === item.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                }`}
              >
                <i className={`fas fa-${item.icon}`}></i>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.badgeType === 'alert' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-dark-700 text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} ${wsConnected ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs text-gray-400">{wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg">
              <span className="text-xs text-gray-400">Scope</span>
              <select
                className="bg-dark-800 border border-dark-600 rounded-md text-xs text-gray-300 px-2 py-1 focus:outline-none focus:border-primary-500"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="master">Master</option>
                <option value="machine">Single Machine</option>
              </select>
            </div>
            {scope === 'machine' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg max-w-xs">
                <span className="text-xs text-gray-400 whitespace-nowrap">Machine</span>
                <select
                  className="bg-dark-800 border border-dark-600 rounded-md text-xs text-gray-300 px-2 py-1 focus:outline-none focus:border-primary-500 truncate"
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                >
                  {machineOptions.length === 0 ? (
                    <option value="">No machines</option>
                  ) : (
                    machineOptions.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))
                  )}
                </select>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="w-9 h-9 flex items-center justify-center bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-primary-400 transition-colors"
              title="Refresh"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button
              onClick={onIngestNow}
              className="w-9 h-9 flex items-center justify-center bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
              title="Ingest CVEs now"
            >
              <i className="fas fa-bolt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

