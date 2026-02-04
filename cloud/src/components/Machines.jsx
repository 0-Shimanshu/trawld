export default function Machines({ data, loading }) {
  const machines = data.machines || []

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading machines...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Machines</h1>
          <p className="text-gray-400">Monitor and manage registered machines</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary-500"
            placeholder="Search machines..."
          />
          <select className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-primary-500">
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500">No machines registered</div>
        ) : (
          machines.map((machine, idx) => {
            const lastSeen = new Date(machine.last_seen)
            // Consider offline if not seen in 120 seconds (allows for network delays)
            const isOnline = (Date.now() - lastSeen.getTime()) / 1000 < 120
            
            return (
              <div key={idx} className="card hover:border-primary-500/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-semibold text-white mb-1">{machine.hostname || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 font-mono">{machine.uuid}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    isOnline 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">OS</span>
                    <span className="text-white font-medium">{machine.os || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Seen</span>
                    <span className="text-white font-medium">{lastSeen.toLocaleString()}</span>
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

