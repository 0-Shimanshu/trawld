import { useMemo, useState } from 'react'
import { remediateAlert } from '../api/alerts'

export default function Packages({ data, loading, selectedMachine, scope, onChange }) {
  const [query, setQuery] = useState('')
  const [ecosystem, setEcosystem] = useState('all')
  const [busyKey, setBusyKey] = useState('')
  const packages = data.packages || []
  const projects = data.projects || []

  const projectNameById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.label || project.name]))
  }, [projects])

  const projectManagerById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.package_manager || 'unknown']))
  }, [projects])

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesQuery = query.trim() === '' || [pkg.name, pkg.project_label, pkg.project_root, pkg.version, pkg.machine_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query.trim().toLowerCase()))
      const matchesEcosystem = ecosystem === 'all' || pkg.ecosystem === ecosystem
      return matchesQuery && matchesEcosystem
    })
  }, [packages, query, ecosystem])

  const projectsCovered = useMemo(() => new Set(filteredPackages.map((pkg) => pkg.project_id)).size, [filteredPackages])
  const autoUpdateReady = useMemo(() => filteredPackages.filter((pkg) => pkg.remediation_alert_id && (pkg.fixes || []).length > 0).length, [filteredPackages])
  const findingsCount = useMemo(() => filteredPackages.filter((pkg) => pkg.vulnerability_count > 0).length, [filteredPackages])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Loading package inventory...</p>
      </div>
    )
  }

  const remediatePackage = async (alertId) => {
    try {
      setBusyKey(alertId)
      await remediateAlert(alertId)
      onChange?.()
    } catch (error) {
      console.error('Failed to queue remediation:', error)
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Package Inventory</h1>
          <p className="mt-2 text-slate-500">
            {scope === 'machine' && selectedMachine
              ? `Project-scoped packages reported by ${selectedMachine.hostname || selectedMachine.uuid}.`
              : 'Search package inventory, inspect OSV findings, and trigger package-manager-aware updates from one place.'}
          </p>
        </div>

        <div className="soft-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[280px]">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="Search package, project, root, or version..."
              />
            </div>
            <select
              value={ecosystem}
              onChange={(event) => setEcosystem(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            >
              <option value="all">All ecosystems</option>
              <option value="npm">npm</option>
              <option value="PyPI">PyPI</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="soft-panel px-6 py-5">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory In View</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <div className="text-4xl font-black tracking-tight text-slate-950">{filteredPackages.length}</div>
              <div className="mt-1 text-sm text-slate-500">packages across {projectsCovered} projects</div>
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-rose-600">{findingsCount}</div>
              <div className="mt-1 text-sm text-slate-500">packages with active findings</div>
            </div>
          </div>
        </div>

        <div className="soft-panel px-6 py-5">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Automatic Remediation</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <div className="text-4xl font-black tracking-tight text-emerald-600">{autoUpdateReady}</div>
              <div className="mt-1 text-sm text-slate-500">packages can be updated automatically</div>
            </div>
            <p className="max-w-sm text-sm text-slate-500">
              Updates follow the project&apos;s detected package manager, such as npm, Poetry, Pipenv, or project manifest files.
            </p>
          </div>
        </div>
      </div>

      <div className="card !p-0 border-none shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.05fr_1.2fr_0.55fr_0.7fr_1fr_0.7fr] gap-0 bg-slate-50/90 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              <div className="px-7 py-4">Package</div>
              <div className="px-7 py-4">Project</div>
              <div className="px-7 py-4">Version</div>
              <div className="px-7 py-4">Findings</div>
              <div className="px-7 py-4">Fix</div>
              <div className="px-7 py-4">OSV</div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
              {filteredPackages.length === 0 ? (
                <div className="px-7 py-28 text-center text-slate-400">
                  No packages matched the current search and ecosystem filters.
                </div>
              ) : (
                filteredPackages.map((pkg) => {
                  const packageManager = projectManagerById.get(pkg.project_id) || 'unknown'
                  const projectLabel = projectNameById.get(pkg.project_id) || pkg.project_label || 'Unknown'

                  return (
                    <div key={`${pkg.project_id}:${pkg.ecosystem}:${pkg.name}:${pkg.version}`} className="grid grid-cols-[1.05fr_1.2fr_0.55fr_0.7fr_1fr_0.7fr] gap-0 hover:bg-slate-50/60 transition-colors">
                      <div className="px-7 py-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-950">{pkg.name}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {pkg.ecosystem}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">{pkg.machine_id}</div>
                      </div>
                      <div className="px-7 py-6">
                        <div className="text-sm font-black text-slate-950">{projectLabel}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {packageManager}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 break-all">{pkg.project_root}</div>
                      </div>
                      <div className="px-7 py-6">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">{pkg.version}</span>
                      </div>
                      <div className="px-7 py-6">
                        <span className={`badge ${pkg.vulnerability_count > 0 ? `badge-${pkg.highest_severity === 'none' ? 'low' : pkg.highest_severity}` : 'badge-low'}`}>
                          {pkg.vulnerability_count} findings
                        </span>
                      </div>
                      <div className="px-7 py-6">
                        {(pkg.fixes || []).length > 0 ? (
                          <div className="flex flex-col items-start gap-3">
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 border border-emerald-100">
                              {pkg.fixes[0]}
                            </span>
                            {pkg.remediation_alert_id && (
                              <button
                                onClick={() => remediatePackage(pkg.remediation_alert_id)}
                                disabled={busyKey === pkg.remediation_alert_id}
                                className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-100 transition-colors ${busyKey === pkg.remediation_alert_id ? 'opacity-70 cursor-not-allowed' : ''}`}
                              >
                                {busyKey === pkg.remediation_alert_id ? 'Updating…' : 'Auto Update'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">No published fix</span>
                        )}
                      </div>
                      <div className="px-7 py-6">
                        {(pkg.osv_ids || []).length > 0 ? (
                          <a
                            href={`https://osv.dev/vulnerability/${encodeURIComponent(pkg.osv_ids[0])}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                          >
                            <span>{pkg.osv_ids[0]}</span>
                            <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                          </a>
                        ) : (
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Clean</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
