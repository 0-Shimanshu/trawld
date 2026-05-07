export default function AgentOnboarding({ session }) {
  const cloudUrl = session?.public_cloud_url || window.location.origin
  const wsUrl = cloudUrl.replace(/^http/i, 'ws').replace(/\/$/, '') + '/agents'
  const enrollmentToken = session?.enrollment_token || 'set SENTRY_ENROLLMENT_TOKEN on the cloud'

  return (
    <section className="soft-panel px-6 py-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">Agent Enrollment</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Give this setup flow to machines that should report package inventory to this Cloud Brain.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          sentry-agent setup
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Cloud HTTP</div>
          <div className="mt-2 break-all text-sm font-black text-slate-900">{cloudUrl}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Cloud WebSocket</div>
          <div className="mt-2 break-all text-sm font-black text-slate-900">{wsUrl}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Enrollment Token</div>
          <div className="mt-2 break-all text-sm font-black text-slate-900">{enrollmentToken}</div>
        </div>
      </div>
    </section>
  )
}

