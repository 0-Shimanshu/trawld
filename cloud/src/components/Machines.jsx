import { useMemo, useState } from 'react'

export default function Machines({ data, fullData, loading, onScanMachine, onSelectMachine }) {
  const [query, setQuery] = useState('')
  const machines = data.machines || []

  const filteredMachines = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return machines
    return machines.filter((machine) => {
      return [machine.hostname, machine.uuid, machine.os]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    })
  }, [machines, query])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Discovering machine inventory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Machine Inventory</h1>
          <p className="mt-2 text-slate-500">Review endpoint health, package exposure, and project coverage without leaving the dashboard.</p>
        </div>

        <div className="w-full lg:w-[360px] relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            placeholder="Search hostname, UUID, or OS..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredMachines.length === 0 ? (
          <div className="col-span-full card py-20 text-center border-dashed border-2">
            <p className="text-lg font-bold text-slate-600">No machines matched your search.</p>
            <p className="text-sm text-slate-400 mt-2">Try a different hostname, OS, or machine identifier.</p>
          </div>
        ) : (
          filteredMachines.map((machine) => {
            const machineProjects = (fullData.projects || []).filter((project) => project.machine_id === machine.uuid)
            const isOnline = (Date.now() - new Date(machine.last_seen).getTime()) / 1000 < 120

            return (
              <div
                key={machine.uuid}
                className="card border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                onClick={() => onSelectMachine(machine.uuid)}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-black tracking-tight text-slate-950 truncate">{machine.hostname || 'Unnamed Machine'}</h2>
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                          isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500 break-all">{machine.uuid}</div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onScanMachine(machine.uuid)
                        }}
                        className="btn-secondary"
                      >
                        <i className="fas fa-shield-heart"></i>
                        <span>Rescan</span>
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelectMachine(machine.uuid)
                        }}
                        className="btn-primary"
                      >
                        <i className="fas fa-arrow-right"></i>
                        <span>Open Machine</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">OS</div>
                      <div className="mt-2 text-base font-black text-slate-950">{machine.os || 'Unknown'}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Projects</div>
                      <div className="mt-2 text-base font-black text-slate-950">{machine.project_count || machineProjects.length}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Packages</div>
                      <div className="mt-2 text-base font-black text-slate-950">{machine.package_count || 0}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Open Alerts</div>
                      <div className="mt-2 text-base font-black text-rose-600">{machine.alert_count || 0}</div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="text-sm font-black text-slate-950">Project Coverage</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Last seen {new Date(machine.last_seen).toLocaleString()}
                      </div>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto pr-1 custom-scrollbar space-y-3">
                      {machineProjects.length === 0 ? (
                        <div className="text-sm text-slate-400">No project snapshots have been reported from this machine yet.</div>
                      ) : (
                        machineProjects.map((project) => (
                          <div key={project.id} className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-black text-slate-950 truncate">{project.label || project.name}</div>
                                <div className="text-xs text-slate-500 truncate mt-1">{project.root}</div>
                              </div>
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-600 border border-indigo-100">
                                {project.package_count || 0} pkgs
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
