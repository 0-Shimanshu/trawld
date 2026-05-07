import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: 'chart-pie', label: 'Overview' },
  { to: '/machines', icon: 'desktop', label: 'Machines' },
  { to: '/alerts', icon: 'triangle-exclamation', label: 'Alerts' },
  { to: '/packages', icon: 'boxes-stacked', label: 'Packages' },
  { to: '/analytics', icon: 'chart-line', label: 'Analytics' }
]

export default function TopNav({
  wsConnected,
  summary,
  summaryLoading,
  onRefresh,
  onIngestNow,
  ingesting,
  onLogout
}) {
  const location = useLocation()
  const alertsCount = (summary.alerts || []).filter((alert) => alert.status !== 'ack').length
  const machinesCount = (summary.machines || []).length
  const projectsCount = (summary.projects || []).length
  const packagesCount = (summary.packages || []).length
  const isMachineDetail = location.pathname.startsWith('/machines/')
  const navTitle = isMachineDetail ? 'Machine Detail' : 'Cloud Brain'

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/72 backdrop-blur-2xl shadow-[0_28px_80px_-44px_rgba(15,23,42,0.38)]">
      <div className="mx-auto flex max-w-[1720px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-10 2xl:px-12">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,_#020617,_#2563eb_72%)] text-white shadow-[0_22px_44px_-22px_rgba(37,99,235,0.75)]">
              <i className="fas fa-shield-virus text-xl"></i>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Sentry Control Center</div>
                <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  {navTitle}
                </span>
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                Project-scoped runtime visibility and remediation orchestration
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <div className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-black text-slate-600 shadow-sm">
              {summaryLoading ? 'Refreshing summary...' : `${machinesCount} machines · ${projectsCount} projects · ${packagesCount} packages`}
            </div>
            <div className="rounded-full border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700">
              {alertsCount} open alerts
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {wsConnected ? 'Realtime Connected' : 'Realtime Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-[0_18px_36px_-18px_rgba(15,23,42,0.8)]'
                      : 'border border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950'
                  }`}
                >
                  <i className={`fas fa-${item.icon} text-xs`}></i>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onRefresh} className="btn-secondary !px-4 !py-3" title="Refresh page data">
              <i className="fas fa-rotate text-xs"></i>
              <span>Refresh</span>
            </button>
            <button
              onClick={onIngestNow}
              disabled={ingesting}
              className={`btn-primary !px-4 !py-3 ${ingesting ? 'cursor-not-allowed opacity-70' : ''}`}
              title={ingesting ? 'OSV sync in progress' : 'Force OSV sync'}
            >
              <i className={`fas ${ingesting ? 'fa-spinner fa-spin' : 'fa-bolt'} text-xs`}></i>
              <span>{ingesting ? 'Syncing OSV' : 'Sync OSV'}</span>
            </button>
            <button onClick={onLogout} className="btn-secondary !px-4 !py-3" title="Sign out">
              <i className="fas fa-right-from-bracket text-xs"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
