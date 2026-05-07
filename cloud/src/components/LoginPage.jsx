import { useState } from 'react'
import { login } from '../api/auth'

export default function LoginPage({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const session = await login(password)
      onAuthenticated(session)
    } catch (nextError) {
      setError(nextError?.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-canvas min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1120px] items-center">
        <section className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.9)]">
              <i className="fas fa-shield-virus text-xl"></i>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Sentry Control Center</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Sign in to manage connected agents, package exposure, remediation, and cloud enrollment.
            </p>
          </div>

          <form onSubmit={submit} className="card max-w-md justify-self-stretch lg:justify-self-end">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Dashboard Login</h2>
              <p className="mt-2 text-sm text-slate-500">Use the admin password configured on the cloud brain.</p>
            </div>

            <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400" htmlFor="password">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              autoComplete="current-password"
            />

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            <button className={`btn-primary mt-6 w-full ${loading ? 'cursor-not-allowed opacity-70' : ''}`} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-lock'} text-xs`}></i>
              <span>{loading ? 'Signing in' : 'Sign In'}</span>
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

