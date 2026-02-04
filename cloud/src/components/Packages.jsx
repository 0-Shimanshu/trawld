import { useEffect, useMemo, useState } from 'react'

export default function Packages({ data, loading, scope, machineId }) {
  const alerts = data.alerts || []
  const [inventory, setInventory] = useState([])
  const [invLoading, setInvLoading] = useState(false)
  const [invError, setInvError] = useState('')
  
  // Aggregate packages
  const pkgMap = new Map()
  alerts.forEach(a => {
    const pkg = a.package
    if (!pkg) return
    const key = `${pkg.ecosystem}:${pkg.name}`
    if (!pkgMap.has(key)) {
      pkgMap.set(key, {
        ecosystem: pkg.ecosystem,
        name: pkg.name,
        versions: new Set(),
        machines: new Set(),
        vulnerabilities: 0
      })
    }
    const entry = pkgMap.get(key)
    entry.versions.add(pkg.version)
    entry.machines.add(a.machine_id)
    entry.vulnerabilities++
  })

  const packages = Array.from(pkgMap.values()).map(p => ({
    ...p,
    versions: Array.from(p.versions),
    machines: Array.from(p.machines)
  }))

  const showInventory = useMemo(() => scope === 'machine' && machineId, [scope, machineId])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!showInventory) {
        setInventory([])
        setInvError('')
        return
      }
      setInvLoading(true)
      setInvError('')
      try {
        const res = await fetch(`/inventory?machine_id=${encodeURIComponent(machineId)}`)
        const json = await res.json()
        if (!cancelled) setInventory(json.packages || [])
      } catch (e) {
        if (!cancelled) setInvError(String(e?.message || e))
      } finally {
        if (!cancelled) setInvLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [showInventory, machineId])

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading packages...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Package Inventory</h1>
          <p className="text-gray-400">Track packages across all machines</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary-500"
            placeholder="Search packages..."
          />
          <select className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-primary-500">
            <option value="all">All Ecosystems</option>
            <option value="npm">npm</option>
            <option value="PyPI">PyPI</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ecosystem</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Package Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Machines</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Vulnerabilities</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">No packages found</td>
                </tr>
              ) : (
                packages.map((pkg, idx) => {
                  const vulnBadge = pkg.vulnerabilities > 0 
                    ? `badge-${pkg.vulnerabilities > 5 ? 'critical' : pkg.vulnerabilities > 2 ? 'high' : 'medium'}`
                    : 'badge-low'
                  
                  return (
                    <tr key={idx} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-300">{pkg.ecosystem || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-300">{pkg.name || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{pkg.versions.join(', ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{pkg.machines.length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${vulnBadge}`}>{pkg.vulnerabilities}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${pkg.vulnerabilities > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {pkg.vulnerabilities > 0 ? 'Vulnerable' : 'Safe'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-primary-400 hover:text-primary-300">
                          <i className="fas fa-search"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInventory && (
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Machine Inventory</h3>
              <p className="text-sm text-gray-400">Raw package inventory for the selected machine</p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => window.location.reload()}
              title="Hard refresh"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Reload
            </button>
          </div>
          {invLoading ? (
            <div className="text-gray-400">Loading inventory...</div>
          ) : invError ? (
            <div className="text-red-400 text-sm">Failed to load inventory: {invError}</div>
          ) : inventory.length === 0 ? (
            <div className="text-gray-500">No inventory received for this machine yet. (Run the agent + runtime hook to send inventory.)</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ecosystem</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {inventory.map((p, idx) => (
                    <tr key={idx} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">{p.ecosystem}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{p.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

